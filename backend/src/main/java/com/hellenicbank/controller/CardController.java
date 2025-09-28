package com.hellenicbank.controller;

import com.hellenicbank.dto.CardRequest;
import com.hellenicbank.dto.CardResponse;
import com.hellenicbank.dto.CardStatusUpdateRequest;
import com.hellenicbank.entity.Card;
import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.service.CardService;
import com.hellenicbank.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {
    
    private final CardService cardService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<CardResponse>> getMyCards(Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<CardResponse> cards = cardService.getCardsByUser(user);
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CardResponse>> getAllCards() {
        List<CardResponse> cards = cardService.getAllCards();
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CardResponse>> getUserCards(@PathVariable Long userId) {
        List<CardResponse> cards = cardService.getCardsByUserId(userId);
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CardResponse>> getAllCardsAdmin() {
        List<CardResponse> cards = cardService.getAllCards();
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CardResponse> getCard(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        Optional<CardResponse> cardOpt = cardService.getCardById(id);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        CardResponse card = cardOpt.get();
        // Check if user owns the card or is admin
        if (card.getUserId().equals(user.getId()) || user.getRole() == User.Role.ADMIN) {
            return ResponseEntity.ok(card);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<CardResponse> createCard(@Valid @RequestBody CardRequest request, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            CardResponse card = cardService.createCard(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(card);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> createCardAdmin(@RequestBody Map<String, Object> cardData) {
        try {
            CardRequest request = new CardRequest();
            request.setType(Card.CardType.valueOf(cardData.get("type").toString()));
            request.setAccountId(Long.parseLong(cardData.get("accountId").toString()));
            if (cardData.containsKey("creditLimit")) {
                request.setCreditLimit(new BigDecimal(cardData.get("creditLimit").toString()));
            }
            
            Long userId = Long.parseLong(cardData.get("userId").toString());
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            CardResponse card = cardService.createCardAdmin(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(card);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<CardResponse> updateCardStatus(@PathVariable Long id, 
                                                       @Valid @RequestBody CardStatusUpdateRequest request,
                                                       Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            CardResponse card = cardService.updateCardStatus(id, request, user);
            return ResponseEntity.ok(card);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @PutMapping("/{id}/status/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> updateCardStatusAdmin(@PathVariable Long id, 
                                                            @Valid @RequestBody CardStatusUpdateRequest request) {
        try {
            CardResponse card = cardService.updateCardStatusAdmin(id, request);
            return ResponseEntity.ok(card);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCardAdmin(@PathVariable Long id, 
                                           @RequestBody Map<String, Object> updates) {
        try {
            CardResponse card = cardService.updateCardAdmin(id, updates);
            return ResponseEntity.ok(card);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error updating card: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating card: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating card: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            cardService.deleteCard(id, user);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCardAdmin(@PathVariable Long id) {
        try {
            cardService.deleteCardAdmin(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CardResponse>> getPendingCards() {
        List<Card> cards = cardService.getPendingCards();
        List<CardResponse> cardResponses = cards.stream()
                .map(CardResponse::new)
                .toList();
        return ResponseEntity.ok(cardResponses);
    }
    
    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> approveCard(@PathVariable Long id) {
        try {
            Card card = cardService.approveCard(id);
            return ResponseEntity.ok(new CardResponse(card));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectCard(@PathVariable Long id) {
        try {
            cardService.rejectCard(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> cancelCard(@PathVariable Long id) {
        try {
            Card card = cardService.cancelCard(id);
            return ResponseEntity.ok(new CardResponse(card));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

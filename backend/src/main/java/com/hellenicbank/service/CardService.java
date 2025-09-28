package com.hellenicbank.service;

import com.hellenicbank.dto.CardRequest;
import com.hellenicbank.dto.CardResponse;
import com.hellenicbank.dto.CardStatusUpdateRequest;
import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.Card;
import com.hellenicbank.entity.User;
import com.hellenicbank.repository.AccountRepository;
import com.hellenicbank.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CardService {
    
    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    
    public List<CardResponse> getCardsByUser(User user) {
        List<Card> cards = cardRepository.findByUser(user);
        return cards.stream()
                .map(CardResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<CardResponse> getCardsByUserId(Long userId) {
        List<Card> cards = cardRepository.findByUserId(userId);
        return cards.stream()
                .map(CardResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<CardResponse> getAllCards() {
        List<Card> cards = cardRepository.findAll();
        return cards.stream()
                .map(CardResponse::new)
                .collect(Collectors.toList());
    }
    
    public Optional<CardResponse> getCardById(Long id) {
        return cardRepository.findById(id)
                .map(CardResponse::new);
    }
    
    public CardResponse createCard(CardRequest request, User user) {
        // Find the account
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        // Check if user owns the account
        if (!account.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only create cards for your own accounts");
        }
        
        // Validate credit limit for credit cards
        if (request.getType() == Card.CardType.CREDIT && 
            (request.getCreditLimit() == null || request.getCreditLimit().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Credit limit is required for credit cards and must be greater than 0");
        }
        
        // Generate card details
        String maskedNumber = generateMaskedCardNumber();
        LocalDate expiryDate = LocalDate.now().plusYears(3);
        
        Card card = new Card();
        card.setUser(user);
        card.setAccount(account);
        card.setType(request.getType());
        card.setMaskedNumber(maskedNumber);
        card.setExpiryMonth(expiryDate.getMonthValue());
        card.setExpiryYear(expiryDate.getYear());
        // Set status to PENDING for admin approval
        card.setStatus(Card.CardStatus.PENDING);
        card.setCreditLimit(request.getCreditLimit());
        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());
        
        Card savedCard = cardRepository.save(card);
        return new CardResponse(savedCard);
    }
    
    public CardResponse createCardAdmin(CardRequest request, User user) {
        // Find the account
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        // Validate credit limit for credit cards
        if (request.getType() == Card.CardType.CREDIT && 
            (request.getCreditLimit() == null || request.getCreditLimit().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Credit limit is required for credit cards and must be greater than 0");
        }
        
        // Generate card details
        String maskedNumber = generateMaskedCardNumber();
        LocalDate expiryDate = LocalDate.now().plusYears(3);
        
        Card card = new Card();
        card.setUser(user);
        card.setAccount(account);
        card.setType(request.getType());
        card.setMaskedNumber(maskedNumber);
        card.setExpiryMonth(expiryDate.getMonthValue());
        card.setExpiryYear(expiryDate.getYear());
        // Admin can create cards directly as ACTIVE
        card.setStatus(Card.CardStatus.ACTIVE);
        card.setCreditLimit(request.getCreditLimit());
        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());
        
        Card savedCard = cardRepository.save(card);
        return new CardResponse(savedCard);
    }
    
    public CardResponse updateCardStatus(Long cardId, CardStatusUpdateRequest request, User user) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        // Check if user owns the card
        if (!card.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own cards");
        }
        
        card.setStatus(request.getStatus());
        card.setUpdatedAt(LocalDateTime.now());
        
        Card updatedCard = cardRepository.save(card);
        return new CardResponse(updatedCard);
    }
    
    public CardResponse updateCardStatusAdmin(Long cardId, CardStatusUpdateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        card.setStatus(request.getStatus());
        card.setUpdatedAt(LocalDateTime.now());
        
        Card updatedCard = cardRepository.save(card);
        return new CardResponse(updatedCard);
    }
    
    public CardResponse updateCardAdmin(Long cardId, Map<String, Object> updates) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        if (updates.containsKey("status")) {
            card.setStatus(Card.CardStatus.valueOf(updates.get("status").toString()));
        }
        if (updates.containsKey("creditLimit")) {
            card.setCreditLimit(new BigDecimal(updates.get("creditLimit").toString()));
        }
        
        card.setUpdatedAt(LocalDateTime.now());
        
        Card updatedCard = cardRepository.save(card);
        return new CardResponse(updatedCard);
    }
    
    public void deleteCard(Long cardId, User user) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        // Check if user owns the card
        if (!card.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own cards");
        }
        
        cardRepository.delete(card);
    }
    
    public void deleteCardAdmin(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        cardRepository.delete(card);
    }
    
    public Card approveCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        if (card.getStatus() != Card.CardStatus.PENDING) {
            throw new IllegalArgumentException("Card is not pending approval");
        }
        
        card.setStatus(Card.CardStatus.ACTIVE);
        card.setUpdatedAt(LocalDateTime.now());
        return cardRepository.save(card);
    }
    
    public void rejectCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        if (card.getStatus() != Card.CardStatus.PENDING) {
            throw new IllegalArgumentException("Card is not pending approval");
        }
        
        cardRepository.delete(card);
    }
    
    public List<Card> getPendingCards() {
        return cardRepository.findByStatus(Card.CardStatus.PENDING);
    }
    
    @Transactional
    public Card cancelCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        if (card.getStatus() == Card.CardStatus.CANCELLED) {
            throw new IllegalArgumentException("Card is already cancelled");
        }
        
        // Set status to cancelled
        card.setStatus(Card.CardStatus.CANCELLED);
        card.setUpdatedAt(LocalDateTime.now());
        
        return cardRepository.save(card);
    }
    
    private String generateMaskedCardNumber() {
        Random random = new Random();
        int lastFour = random.nextInt(9000) + 1000; // 1000-9999
        return String.format("**** **** **** %04d", lastFour);
    }
}

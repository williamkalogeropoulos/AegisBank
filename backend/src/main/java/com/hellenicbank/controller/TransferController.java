package com.hellenicbank.controller;

import com.hellenicbank.dto.TransferRequest;
import com.hellenicbank.dto.TransferResponse;
import com.hellenicbank.dto.UpdateTransferRequest;
import com.hellenicbank.entity.Transfer;
import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {
    
    private final TransferService transferService;
    
    @PostMapping
    public ResponseEntity<TransferResponse> createTransfer(@Valid @RequestBody TransferRequest request,
                                                          Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Transfer transfer = transferService.createTransfer(request, user.getId());
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/legacy")
    public ResponseEntity<TransferResponse> createTransferLegacy(@RequestParam Long fromAccountId,
                                                               @RequestParam String toIban,
                                                               @RequestParam BigDecimal amount,
                                                               @RequestParam(required = false) String description,
                                                               @RequestParam(required = false) String category,
                                                               Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Transfer transfer = transferService.createTransfer(fromAccountId, toIban, amount, 
                                                             description, category, user.getId());
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/inter-account")
    public ResponseEntity<TransferResponse> createInterAccountTransfer(@RequestParam Long fromAccountId,
                                                                     @RequestParam Long toAccountId,
                                                                     @RequestParam BigDecimal amount,
                                                                     @RequestParam(required = false) String description,
                                                                     @RequestParam(required = false) String category,
                                                                     Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Transfer transfer = transferService.createInterAccountTransfer(fromAccountId, toAccountId, amount, 
                                                                         description, category, user.getId());
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<TransferResponse>> getUserTransfers(Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        List<Transfer> transfers = transferService.getUserTransfers(user.getId());
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> getUserTransfersAdmin(@PathVariable Long userId) {
        List<Transfer> transfers = transferService.getUserTransfers(userId);
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<TransferResponse>> getRecentTransfers(@RequestParam(defaultValue = "30") int days,
                                                           Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        List<Transfer> transfers = transferService.getRecentTransfers(user.getId(), days);
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransfer(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        return transferService.findById(id)
                .filter(transfer -> transfer.getFromAccount().getUser().getId().equals(user.getId()) || 
                                  user.getRole() == User.Role.ADMIN)
                .map(transfer -> ResponseEntity.ok(new TransferResponse(transfer)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/process")
    public ResponseEntity<TransferResponse> processTransfer(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Transfer transfer = transferService.processTransfer(id, user.getId());
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferResponse> processTransferAdmin(@PathVariable Long id) {
        try {
            Transfer transfer = transferService.processTransferAdmin(id);
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferResponse> updateTransferStatus(@PathVariable Long id,
                                                        @RequestParam Transfer.TransferStatus status) {
        Transfer transfer = transferService.updateTransferStatus(id, status);
        return ResponseEntity.ok(new TransferResponse(transfer));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> getAllTransfers() {
        List<Transfer> transfers = transferService.getAllTransfers();
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/admin/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> getRecentTransfersAdmin(@RequestParam(defaultValue = "30") int days) {
        List<Transfer> transfers = transferService.getRecentTransfers(days);
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    // UPDATE operations
    @PutMapping("/{id}")
    public ResponseEntity<TransferResponse> updateTransfer(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateTransferRequest request,
                                                          Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Transfer transfer = transferService.updateTransfer(id, request, user.getId());
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // DELETE operations
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            transferService.deleteTransfer(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Admin DELETE operations
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTransferAdmin(@PathVariable Long id) {
        try {
            transferService.deleteTransferAdmin(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // REVERSE operations
    @PostMapping("/{id}/reverse")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferResponse> reverseTransfer(@PathVariable Long id) {
        try {
            Transfer transfer = transferService.reverseTransfer(id);
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // CANCEL operations
    @PostMapping("/admin/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferResponse> cancelTransfer(@PathVariable Long id) {
        try {
            Transfer transfer = transferService.cancelTransfer(id);
            return ResponseEntity.ok(new TransferResponse(transfer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // SEARCH and FILTER operations
    @GetMapping("/search/type")
    public ResponseEntity<List<TransferResponse>> getTransfersByType(@RequestParam Transfer.TransferType type,
                                                                    Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Transfer> transfers = transferService.getTransfersByType(type, user.getId());
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/search/date-range")
    public ResponseEntity<List<TransferResponse>> getTransfersByDateRange(@RequestParam String startDate,
                                                                         @RequestParam String endDate,
                                                                         Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            List<Transfer> transfers = transferService.getTransfersByDateRange(start, end, user.getId());
            List<TransferResponse> transferResponses = transfers.stream()
                    .map(TransferResponse::new)
                    .toList();
            return ResponseEntity.ok(transferResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search/amount-range")
    public ResponseEntity<List<TransferResponse>> getTransfersByAmountRange(@RequestParam BigDecimal minAmount,
                                                                           @RequestParam BigDecimal maxAmount,
                                                                           Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Transfer> transfers = transferService.getTransfersByAmountRange(minAmount, maxAmount, user.getId());
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/search/category")
    public ResponseEntity<List<TransferResponse>> getTransfersByCategory(@RequestParam String category,
                                                                        Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Transfer> transfers = transferService.getTransfersByCategory(category, user.getId());
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    // Admin search operations
    @GetMapping("/admin/search/type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> getTransfersByTypeAdmin(@RequestParam Transfer.TransferType type) {
        List<Transfer> transfers = transferService.getTransfersByType(type, null);
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
    
    @GetMapping("/admin/search/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> getTransfersByStatusAdmin(@RequestParam Transfer.TransferStatus status) {
        List<Transfer> transfers = transferService.getTransfersByStatus(status);
        List<TransferResponse> transferResponses = transfers.stream()
                .map(TransferResponse::new)
                .toList();
        return ResponseEntity.ok(transferResponses);
    }
}

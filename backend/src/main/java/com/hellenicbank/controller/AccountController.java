package com.hellenicbank.controller;

import com.hellenicbank.dto.AccountRequest;
import com.hellenicbank.dto.AccountResponse;
import com.hellenicbank.dto.AccountUpdateRequest;
import com.hellenicbank.dto.TransferResponse;
import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.service.AccountService;
import com.hellenicbank.service.TransferService;
import com.hellenicbank.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    
    private final AccountService accountService;
    private final TransferService transferService;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getUserAccounts(Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        List<Account> accounts = accountService.getUserAccounts(user.getId());
        List<AccountResponse> accountResponses = accounts.stream()
                .map(AccountResponse::new)
                .toList();
        return ResponseEntity.ok(accountResponses);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getUserAccountsAdmin(@PathVariable Long userId) {
        List<Account> accounts = accountService.getUserAccounts(userId);
        List<AccountResponse> accountResponses = accounts.stream()
                .map(AccountResponse::new)
                .toList();
        return ResponseEntity.ok(accountResponses);
    }
    
    @PostMapping
    public ResponseEntity<?> createAccount(@Valid @RequestBody AccountRequest request, 
                                          Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Account account = accountService.createAccount(user, request.getType(), request.getNickname());
            return ResponseEntity.status(HttpStatus.CREATED).body(new AccountResponse(account));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create account: " + e.getMessage());
        }
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable Long id, Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        Optional<Account> accountOpt = accountService.findById(id);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Account account = accountOpt.get();
        if (!account.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(new AccountResponse(account));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Long id, 
                                                        @Valid @RequestBody AccountUpdateRequest request,
                                                        Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        Optional<Account> accountOpt = accountService.findById(id);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Account account = accountOpt.get();
        if (!account.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Users can update type and status (freeze/unfreeze), admins can update everything
        if (user.getRole() == User.Role.USER) {
            // For users, allow type and status updates (for freeze/unfreeze functionality)
            if (request.getType() != null) {
                account.setType(request.getType());
            }
            if (request.getStatus() != null) {
                account.setStatus(request.getStatus());
            }
            if (request.getNickname() != null) {
                account.setNickname(request.getNickname());
            }
        } else {
            // Admin can update everything
            if (request.getType() != null) {
                account.setType(request.getType());
            }
            if (request.getStatus() != null) {
                account.setStatus(request.getStatus());
            }
            if (request.getBalance() != null) {
                account.setBalance(request.getBalance());
            }
            if (request.getNickname() != null) {
                account.setNickname(request.getNickname());
            }
        }
        
        Account updatedAccount = accountService.updateAccount(account);
        return ResponseEntity.ok(new AccountResponse(updatedAccount));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        List<Account> accounts = accountService.getAllAccounts();
        List<AccountResponse> accountResponses = accounts.stream()
                .map(AccountResponse::new)
                .toList();
        return ResponseEntity.ok(accountResponses);
    }
    
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getPendingAccounts() {
        List<Account> accounts = accountService.getPendingAccounts();
        List<AccountResponse> accountResponses = accounts.stream()
                .map(AccountResponse::new)
                .toList();
        return ResponseEntity.ok(accountResponses);
    }
    
    
    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> approveAccount(@PathVariable Long id) {
        try {
            Account account = accountService.approveAccount(id);
            return ResponseEntity.ok(new AccountResponse(account));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectAccount(@PathVariable Long id) {
        try {
            accountService.rejectAccount(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/freeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> freezeAccount(@PathVariable Long id) {
        try {
            Account account = accountService.freezeAccount(id);
            return ResponseEntity.ok(new AccountResponse(account));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/unfreeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> unfreezeAccount(@PathVariable Long id) {
        try {
            Account account = accountService.unfreezeAccount(id);
            return ResponseEntity.ok(new AccountResponse(account));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> cancelAccount(@PathVariable Long id) {
        try {
            Account account = accountService.cancelAccount(id);
            return ResponseEntity.ok(new AccountResponse(account));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAccountPermanently(@PathVariable Long id) {
        try {
            accountService.deleteAccountPermanently(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransferResponse>> getAccountTransactions(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();
            
            // Verify account ownership
            Optional<Account> account = accountService.findById(id);
            if (account.isEmpty() || !account.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }
            
            List<TransferResponse> transactions = transferService.getAccountTransactions(id);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/statement")
    public ResponseEntity<byte[]> downloadStatement(
            @PathVariable Long id,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "PDF") String format,
            Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();
            
            // Verify account ownership
            Optional<Account> account = accountService.findById(id);
            if (account.isEmpty() || !account.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }
            
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            byte[] statementData = transferService.generateStatement(id, start, end, format);
            
            String contentType = format.equalsIgnoreCase("PDF") ? "application/pdf" : "text/csv";
            String filename = String.format("statement_%s_%s_%s.%s", 
                account.get().getIban(), startDate, endDate, format.toLowerCase());
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(statementData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> createAccountAdmin(@RequestBody Map<String, Object> accountData) {
        try {
            Account.AccountType type = Account.AccountType.valueOf(accountData.get("type").toString());
            String nickname = accountData.get("nickname").toString();
            
            Long userId = Long.parseLong(accountData.get("userId").toString());
            User user = userService.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Account account = accountService.createAccountAdmin(user, type, nickname);
            
            // Set initial balance if provided
            if (accountData.containsKey("balance")) {
                BigDecimal balance = new BigDecimal(accountData.get("balance").toString());
                account.setBalance(balance);
                account = accountService.updateAccount(account);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new AccountResponse(account));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/admin/{id}/test")
    // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
    public ResponseEntity<?> testAccountUpdate(@PathVariable Long id, 
                                             @RequestBody Map<String, Object> updates) {
        System.out.println("=== TEST ENDPOINT HIT ===");
        System.out.println("Account ID: " + id);
        System.out.println("Updates: " + updates);
        
        // Check authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + auth);
        System.out.println("Authorities: " + auth.getAuthorities());
        System.out.println("Principal: " + auth.getPrincipal());
        
        return ResponseEntity.ok(Map.of("message", "Test endpoint working", "received", updates));
    }
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAccountAdmin(@PathVariable Long id, 
                                               @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("=== ACCOUNT UPDATE DEBUG ===");
            System.out.println("Account ID: " + id);
            System.out.println("Updates received: " + updates);
            
            Optional<Account> accountOpt = accountService.findById(id);
            if (accountOpt.isEmpty()) {
                System.out.println("Account not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Account account = accountOpt.get();
            System.out.println("Found account: " + account.getIban() + " with balance: " + account.getBalance());
            
            // Ensure IBAN is not empty (should not happen, but safety check)
            if (account.getIban() == null || account.getIban().trim().isEmpty()) {
                System.err.println("Account has empty IBAN: " + account.getId());
                throw new IllegalArgumentException("Account has invalid IBAN");
            }
            
            // Update fields based on what's provided
            if (updates.containsKey("status") && updates.get("status") != null) {
                String statusValue = updates.get("status").toString();
                System.out.println("Setting status to: " + statusValue);
                account.setStatus(Account.AccountStatus.valueOf(statusValue));
            }
            if (updates.containsKey("balance") && updates.get("balance") != null) {
                Object balanceObj = updates.get("balance");
                System.out.println("Balance object: " + balanceObj);
                BigDecimal newBalance = new BigDecimal(balanceObj.toString());
                System.out.println("Converted to BigDecimal: " + newBalance);
                account.setBalance(newBalance);
            }
            if (updates.containsKey("nickname")) {
                Object nicknameValue = updates.get("nickname");
                System.out.println("Setting nickname to: " + nicknameValue);
                account.setNickname(nicknameValue != null ? nicknameValue.toString() : null);
            }
            if (updates.containsKey("type") && updates.get("type") != null) {
                String typeValue = updates.get("type").toString();
                System.out.println("Setting type to: " + typeValue);
                account.setType(Account.AccountType.valueOf(typeValue));
            }
            
            System.out.println("About to save account with balance: " + account.getBalance());
            Account updatedAccount = accountService.updateAccount(account);
            System.out.println("Account saved successfully");
            return ResponseEntity.ok(new AccountResponse(updatedAccount));
        } catch (Exception e) {
            System.err.println("Error updating account: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAccountAdmin(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete account: " + e.getMessage());
        }
    }
}

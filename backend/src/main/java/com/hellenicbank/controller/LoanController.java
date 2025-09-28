package com.hellenicbank.controller;

import com.hellenicbank.dto.LoanRequest;
import com.hellenicbank.dto.LoanResponse;
import com.hellenicbank.dto.LoanStatusUpdateRequest;
import com.hellenicbank.entity.Loan;
import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    
    private final LoanService loanService;
    
    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }
    
    // CREATE operations
    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(@Valid @RequestBody LoanRequest request,
                                                   Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Loan loan = loanService.createLoan(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // READ operations
    @GetMapping
    public ResponseEntity<List<LoanResponse>> getUserLoans(Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Loan> loans = loanService.getUserLoans(user.getId());
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getUserLoansAdmin(@PathVariable Long userId) {
        List<Loan> loans = loanService.getUserLoans(userId);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoan(@PathVariable Long id,
                                                Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Loan loan = loanService.getLoanByIdAndUser(id, user.getId());
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanResponse>> getLoansByStatus(@PathVariable Loan.LoanStatus status,
                                                               Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Loan> loans = loanService.getUserLoans(user.getId()).stream()
                .filter(loan -> loan.getStatus() == status)
                .toList();
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    // UPDATE operations
    @PutMapping("/{id}/cancel")
    public ResponseEntity<LoanResponse> cancelLoan(@PathVariable Long id,
                                                   Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            Loan loan = loanService.cancelLoan(id, user.getId());
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // DELETE operations
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id,
                                           Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        try {
            loanService.deleteLoan(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Search and filter operations
    @GetMapping("/search/amount-range")
    public ResponseEntity<List<LoanResponse>> getLoansByAmountRange(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount,
            Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Loan> loans = loanService.getLoansByAmountRange(user.getId(), minAmount, maxAmount);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/search/date-range")
    public ResponseEntity<List<LoanResponse>> getLoansByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        List<Loan> loans = loanService.getLoansByDateRange(user.getId(), start, end);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/search/purpose")
    public ResponseEntity<List<LoanResponse>> getLoansByPurpose(
            @RequestParam String purpose,
            Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
            (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        List<Loan> loans = loanService.getLoansByPurpose(user.getId(), purpose);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    // ADMIN operations
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getAllLoansAdmin() {
        List<Loan> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getAllLoansAdminAll() {
        List<Loan> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> getLoanAdmin(@PathVariable Long id) {
        try {
            Loan loan = loanService.getLoanById(id);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> updateLoanStatus(@PathVariable Long id,
                                                         @Valid @RequestBody LoanStatusUpdateRequest request) {
        try {
            Loan loan = loanService.updateLoanStatus(id, request);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateLoanAdmin(@PathVariable Long id,
                                            @RequestBody Map<String, Object> updates,
                                            Authentication authentication) {
        try {
            System.out.println("Admin loan update request - ID: " + id + ", Updates: " + updates);
            System.out.println("Authentication: " + authentication.getName() + ", Authorities: " + authentication.getAuthorities());
            
            Loan loan = loanService.updateLoanAdmin(id, updates);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error updating loan: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating loan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating loan: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLoanAdmin(@PathVariable Long id) {
        try {
            loanService.deleteLoanAdmin(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansByStatusAdmin(@PathVariable Loan.LoanStatus status) {
        List<Loan> loans = loanService.getLoansByStatus(status);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    // Admin search operations
    @GetMapping("/admin/search/amount-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansByAmountRangeAdmin(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount) {
        List<Loan> loans = loanService.getLoansByAmountRangeAdmin(minAmount, maxAmount);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/admin/search/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansByDateRangeAdmin(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        List<Loan> loans = loanService.getLoansByDateRangeAdmin(start, end);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @GetMapping("/admin/search/purpose")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getLoansByPurposeAdmin(@RequestParam String purpose) {
        List<Loan> loans = loanService.getLoansByPurposeAdmin(purpose);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    // Statistics endpoints
    @GetMapping("/admin/stats/count/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getLoanCountByStatus(@PathVariable Loan.LoanStatus status) {
        Long count = loanService.getLoanCountByStatus(status);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/admin/stats/total/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalPrincipalByStatus(@PathVariable Loan.LoanStatus status) {
        BigDecimal total = loanService.getTotalPrincipalByStatus(status);
        return ResponseEntity.ok(total);
    }
    
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getPendingLoans() {
        List<Loan> loans = loanService.getLoansByStatus(Loan.LoanStatus.PENDING);
        return ResponseEntity.ok(loanService.convertToLoanResponses(loans));
    }
    
    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> approveLoan(@PathVariable Long id) {
        try {
            LoanStatusUpdateRequest request = new LoanStatusUpdateRequest();
            request.setStatus(Loan.LoanStatus.APPROVED);
            request.setAdminNotes("Approved by admin");
            
            Loan loan = loanService.updateLoanStatus(id, request);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> rejectLoan(@PathVariable Long id, @RequestParam(required = false) String reason) {
        try {
            LoanStatusUpdateRequest request = new LoanStatusUpdateRequest();
            request.setStatus(Loan.LoanStatus.REJECTED);
            request.setAdminNotes(reason != null ? reason : "Rejected by admin");
            
            Loan loan = loanService.updateLoanStatus(id, request);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> cancelLoan(@PathVariable Long id, @RequestParam(required = false) String reason) {
        try {
            Loan loan = loanService.cancelLoan(id, reason);
            return ResponseEntity.ok(loanService.convertToLoanResponse(loan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> createLoanAdmin(@RequestBody Map<String, Object> loanData) {
        try {
            LoanRequest request = new LoanRequest();
            request.setPrincipal(new BigDecimal(loanData.get("principal").toString()));
            request.setInterestRate(new BigDecimal(loanData.get("interestRate").toString()));
            request.setTermMonths(Integer.parseInt(loanData.get("termMonths").toString()));
            
            // Handle purpose field safely
            Object purposeObj = loanData.get("purpose");
            if (purposeObj != null && !purposeObj.toString().trim().isEmpty()) {
                request.setPurpose(purposeObj.toString());
            }
            
            Long userId = Long.parseLong(loanData.get("userId").toString());
            Loan loan = loanService.createLoan(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(loanService.convertToLoanResponse(loan));
        } catch (Exception e) {
            System.err.println("Error creating loan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

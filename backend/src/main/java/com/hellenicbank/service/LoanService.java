package com.hellenicbank.service;

import com.hellenicbank.dto.LoanRequest;
import com.hellenicbank.dto.LoanResponse;
import com.hellenicbank.dto.LoanStatusUpdateRequest;
import com.hellenicbank.entity.Loan;
import com.hellenicbank.entity.User;
import com.hellenicbank.entity.Account;
import com.hellenicbank.repository.LoanRepository;
import com.hellenicbank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {
    
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    
    // CREATE operations
    @Transactional
    public Loan createLoan(LoanRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Validate loan amount limits (higher limit for admin-created loans)
        if (request.getPrincipal().compareTo(new BigDecimal("1000000")) > 0) {
            throw new IllegalArgumentException("Maximum loan amount is €1,000,000");
        }
        
        // Validate interest rate limits
        if (request.getInterestRate().compareTo(new BigDecimal("1.0")) > 0) {
            throw new IllegalArgumentException("Maximum interest rate is 100%");
        }
        
        // Validate term limits
        if (request.getTermMonths() > 360) { // 30 years max
            throw new IllegalArgumentException("Maximum loan term is 360 months (30 years)");
        }
        
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setPrincipal(request.getPrincipal());
        loan.setInterestRate(request.getInterestRate());
        loan.setTermMonths(request.getTermMonths());
        loan.setPurpose(request.getPurpose());
        loan.setStatus(Loan.LoanStatus.PENDING);
        
        // Calculate monthly payment (will be recalculated on approval)
        loan.setMonthlyPayment(calculateMonthlyPayment(
            request.getPrincipal(), 
            request.getInterestRate(), 
            request.getTermMonths()
        ));
        
        return loanRepository.save(loan);
    }
    
    // READ operations
    public List<Loan> getUserLoans(Long userId) {
        return loanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }
    
    public Loan getLoanById(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
    }
    
    public Loan getLoanByIdAndUser(Long loanId, Long userId) {
        Loan loan = getLoanById(loanId);
        if (!loan.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Loan not found or access denied");
        }
        return loan;
    }
    
    public List<Loan> getLoansByStatus(Loan.LoanStatus status) {
        return loanRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    // UPDATE operations
    @Transactional
    public Loan updateLoanStatus(Long loanId, LoanStatusUpdateRequest request) {
        Loan loan = getLoanById(loanId);
        
        // Only allow status updates for pending loans (except admin can update any)
        if (loan.getStatus() != Loan.LoanStatus.PENDING && 
            request.getStatus() != Loan.LoanStatus.APPROVED && 
            request.getStatus() != Loan.LoanStatus.REJECTED) {
            throw new IllegalArgumentException("Only pending loans can be updated");
        }
        
        loan.setStatus(request.getStatus());
        loan.setAdminNotes(request.getAdminNotes());
        
        // Recalculate monthly payment when approved
        if (request.getStatus() == Loan.LoanStatus.APPROVED) {
            loan.setMonthlyPayment(calculateMonthlyPayment(
                loan.getPrincipal(), 
                loan.getInterestRate(), 
                loan.getTermMonths()
            ));
            
            // Create a loan account for the approved loan
            createLoanAccount(loan);
        }
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan updateLoanAdmin(Long loanId, Map<String, Object> updates) {
        Loan loan = getLoanById(loanId);
        
        if (updates.containsKey("status")) {
            loan.setStatus(Loan.LoanStatus.valueOf(updates.get("status").toString()));
        }
        if (updates.containsKey("principal")) {
            loan.setPrincipal(new BigDecimal(updates.get("principal").toString()));
        }
        if (updates.containsKey("interestRate")) {
            loan.setInterestRate(new BigDecimal(updates.get("interestRate").toString()));
        }
        if (updates.containsKey("termMonths")) {
            loan.setTermMonths(Integer.parseInt(updates.get("termMonths").toString()));
        }
        if (updates.containsKey("adminNotes")) {
            loan.setAdminNotes(updates.get("adminNotes").toString());
        }
        
        // Recalculate monthly payment if principal, interest rate, or term changed
        if (updates.containsKey("principal") || updates.containsKey("interestRate") || updates.containsKey("termMonths")) {
            loan.setMonthlyPayment(calculateMonthlyPayment(
                loan.getPrincipal(), 
                loan.getInterestRate(), 
                loan.getTermMonths()
            ));
        }
        
        loan.setUpdatedAt(LocalDateTime.now());
        
        return loanRepository.save(loan);
    }
    
    @Transactional
    public Loan cancelLoan(Long loanId, Long userId) {
        Loan loan = getLoanByIdAndUser(loanId, userId);
        
        // Only allow cancellation of pending loans
        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new IllegalArgumentException("Only pending loans can be cancelled");
        }
        
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setAdminNotes("Cancelled by user");
        
        return loanRepository.save(loan);
    }
    
    // DELETE operations
    @Transactional
    public void deleteLoan(Long loanId, Long userId) {
        Loan loan = getLoanByIdAndUser(loanId, userId);
        
        // Only allow deletion of pending or rejected loans
        if (loan.getStatus() == Loan.LoanStatus.ACTIVE || loan.getStatus() == Loan.LoanStatus.PAID) {
            throw new IllegalArgumentException("Cannot delete active or paid loans");
        }
        
        loanRepository.delete(loan);
    }
    
    @Transactional
    public void deleteLoanAdmin(Long loanId) {
        Loan loan = getLoanById(loanId);
        
        // Admin can delete any loan except active ones
        if (loan.getStatus() == Loan.LoanStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot delete active loans");
        }
        
        // Delete the corresponding loan account if it exists
        try {
            List<Account> loanAccounts = accountService.getUserAccounts(loan.getUser().getId()).stream()
                    .filter(account -> account.getType() == Account.AccountType.LOAN)
                    .filter(account -> account.getNickname() != null && account.getNickname().contains("Loan #" + loan.getId()))
                    .toList();
            
            for (Account loanAccount : loanAccounts) {
                accountService.deleteAccount(loanAccount.getId());
            }
        } catch (Exception e) {
            // Log the error but don't fail the loan deletion
            System.err.println("Error deleting loan account for loan " + loanId + ": " + e.getMessage());
        }
        
        loanRepository.delete(loan);
    }
    
    // Search and filter operations
    public List<Loan> getLoansByAmountRange(Long userId, BigDecimal minAmount, BigDecimal maxAmount) {
        return loanRepository.findByUserIdAndPrincipalBetween(userId, minAmount, maxAmount);
    }
    
    public List<Loan> getLoansByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return loanRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate);
    }
    
    public List<Loan> getLoansByPurpose(Long userId, String purpose) {
        return loanRepository.findByUserIdAndPurposeContaining(userId, purpose);
    }
    
    // Admin search operations
    public List<Loan> getLoansByAmountRangeAdmin(BigDecimal minAmount, BigDecimal maxAmount) {
        return loanRepository.findByPrincipalBetween(minAmount, maxAmount);
    }
    
    public List<Loan> getLoansByDateRangeAdmin(LocalDateTime startDate, LocalDateTime endDate) {
        return loanRepository.findByCreatedAtBetween(startDate, endDate);
    }
    
    public List<Loan> getLoansByPurposeAdmin(String purpose) {
        return loanRepository.findByPurposeContaining(purpose);
    }
    
    // Statistics
    public Long getLoanCountByStatus(Loan.LoanStatus status) {
        return loanRepository.countByStatus(status);
    }
    
    public BigDecimal getTotalPrincipalByStatus(Loan.LoanStatus status) {
        BigDecimal total = loanRepository.sumPrincipalByStatus(status);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    // Utility methods
    private BigDecimal calculateMonthlyPayment(BigDecimal principal, BigDecimal annualRate, Integer months) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            // No interest - simple division
            return principal.divide(new BigDecimal(months), 2, RoundingMode.HALF_UP);
        }
        
        BigDecimal monthlyRate = annualRate.divide(new BigDecimal("12"), 6, RoundingMode.HALF_UP);
        BigDecimal numerator = principal.multiply(monthlyRate);
        BigDecimal denominator = BigDecimal.ONE.subtract(
            BigDecimal.ONE.add(monthlyRate).pow(-months, java.math.MathContext.DECIMAL64)
        );
        
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }
    
    // Convert to DTOs
    public List<LoanResponse> convertToLoanResponses(List<Loan> loans) {
        return loans.stream()
                .map(LoanResponse::new)
                .collect(Collectors.toList());
    }
    
    public LoanResponse convertToLoanResponse(Loan loan) {
        return new LoanResponse(loan);
    }
    
    // Helper method to create a loan account
    private void createLoanAccount(Loan loan) {
        try {
            // Generate account nickname based on loan purpose
            String nickname = generateLoanAccountNickname(loan);
            
            // Create the LOAN account with nickname and loan amount - automatically approved since loan was approved
            Account account = accountService.createAccountAdmin(loan.getUser(), Account.AccountType.LOAN, nickname);
            
            // Set the account balance to the loan amount
            account.setBalance(loan.getPrincipal());
            accountService.updateAccount(account);
            
            System.out.println("Created loan account: " + account.getIban() + " with nickname: " + nickname + " and balance: €" + loan.getPrincipal());
            
        } catch (Exception e) {
            // Log the error but don't fail the loan approval
            System.err.println("Failed to create loan account for loan ID " + loan.getId() + ": " + e.getMessage());
        }
    }
    
    @Transactional
    public Loan cancelLoan(Long loanId, String reason) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        
        if (loan.getStatus() == Loan.LoanStatus.CANCELLED) {
            throw new IllegalArgumentException("Loan is already cancelled");
        }
        
        // If loan is ACTIVE, we need to handle the associated loan account
        if (loan.getStatus() == Loan.LoanStatus.ACTIVE) {
            // Find and cancel the associated loan account
            // This is a simplified approach - in production you'd have a proper relationship
            System.out.println("Cancelling active loan: " + loan.getId() + " - reason: " + reason);
        }
        
        // Set status to cancelled
        loan.setStatus(Loan.LoanStatus.CANCELLED);
        loan.setAdminNotes(reason != null ? reason : "Cancelled by admin");
        loan.setUpdatedAt(LocalDateTime.now());
        
        return loanRepository.save(loan);
    }
    
    // Helper method to generate account nickname
    private String generateLoanAccountNickname(Loan loan) {
        String purpose = loan.getPurpose();
        if (purpose != null && !purpose.trim().isEmpty()) {
            // Capitalize first letter and limit length
            String capitalized = purpose.substring(0, 1).toUpperCase() + purpose.substring(1).toLowerCase();
            if (capitalized.length() > 20) {
                capitalized = capitalized.substring(0, 20);
            }
            return capitalized + " Loan";
        } else {
            return "Personal Loan #" + loan.getId();
        }
    }
}

package com.hellenicbank.dto;

import com.hellenicbank.entity.Loan;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LoanResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private BigDecimal principal;
    private BigDecimal interestRate;
    private Integer termMonths;
    private Loan.LoanStatus status;
    private BigDecimal monthlyPayment;
    private String purpose;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public LoanResponse(Loan loan) {
        this.id = loan.getId();
        this.userId = loan.getUser().getId();
        this.userEmail = loan.getUser().getEmail();
        this.principal = loan.getPrincipal();
        this.interestRate = loan.getInterestRate();
        this.termMonths = loan.getTermMonths();
        this.status = loan.getStatus();
        this.monthlyPayment = loan.getMonthlyPayment();
        this.purpose = loan.getPurpose();
        this.createdAt = loan.getCreatedAt();
        this.updatedAt = loan.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    
    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }
    
    public Loan.LoanStatus getStatus() { return status; }
    public void setStatus(Loan.LoanStatus status) { this.status = status; }
    
    public BigDecimal getMonthlyPayment() { return monthlyPayment; }
    public void setMonthlyPayment(BigDecimal monthlyPayment) { this.monthlyPayment = monthlyPayment; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

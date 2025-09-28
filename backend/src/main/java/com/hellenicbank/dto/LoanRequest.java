package com.hellenicbank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

public class LoanRequest {
    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "100.0", message = "Minimum loan amount is €100")
    private BigDecimal principal;
    
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Interest rate must be non-negative")
    private BigDecimal interestRate;
    
    @NotNull(message = "Term in months is required")
    @Min(value = 1, message = "Term must be at least 1 month")
    private Integer termMonths;
    
    private String purpose; // Optional field for loan purpose
    
    // Getters and Setters
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    
    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}

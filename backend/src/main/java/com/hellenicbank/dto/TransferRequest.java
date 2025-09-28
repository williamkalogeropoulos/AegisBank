package com.hellenicbank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

public class TransferRequest {
    
    @NotNull(message = "From account ID is required")
    private Long fromAccountId;
    
    @NotBlank(message = "To IBAN is required")
    private String toIban;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    private String description;
    
    private String category;
    
    // For inter-account transfers
    private Long toAccountId;
    
    // Transfer type: EXTERNAL, INTERNAL, INTER_ACCOUNT
    private TransferType type = TransferType.EXTERNAL;
    
    // Getters and Setters
    public Long getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(Long fromAccountId) { this.fromAccountId = fromAccountId; }
    
    public String getToIban() { return toIban; }
    public void setToIban(String toIban) { this.toIban = toIban; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Long getToAccountId() { return toAccountId; }
    public void setToAccountId(Long toAccountId) { this.toAccountId = toAccountId; }
    
    public TransferType getType() { return type; }
    public void setType(TransferType type) { this.type = type; }
    
    public enum TransferType {
        EXTERNAL,    // To external bank
        INTERNAL,    // To another Aegis Bank account (different user)
        INTER_ACCOUNT // To user's own account
    }
}

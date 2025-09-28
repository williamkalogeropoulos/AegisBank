package com.hellenicbank.dto;

import com.hellenicbank.entity.Transfer;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

public class UpdateTransferRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    private String description;
    
    private String category;
    
    private Transfer.TransferStatus status;
    
    private String toIban;
    
    // Getters and Setters
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Transfer.TransferStatus getStatus() { return status; }
    public void setStatus(Transfer.TransferStatus status) { this.status = status; }
    
    public String getToIban() { return toIban; }
    public void setToIban(String toIban) { this.toIban = toIban; }
}

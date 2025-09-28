package com.hellenicbank.dto;

import com.hellenicbank.entity.Card;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

public class CardRequest {
    
    @NotNull(message = "Account ID is required")
    private Long accountId;
    
    @NotNull(message = "Card type is required")
    private Card.CardType type;
    
    @DecimalMin(value = "0.0", message = "Credit limit must be non-negative")
    private BigDecimal creditLimit;
    
    // Getters and Setters
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public Card.CardType getType() { return type; }
    public void setType(Card.CardType type) { this.type = type; }
    
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
}

package com.hellenicbank.dto;

import com.hellenicbank.entity.Card;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CardResponse {
    
    private Long id;
    private Long userId;
    private Long accountId;
    private Card.CardType type;
    private String maskedNumber;
    private Integer expiryMonth;
    private Integer expiryYear;
    private Card.CardStatus status;
    private BigDecimal creditLimit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public CardResponse(Card card) {
        this.id = card.getId();
        this.userId = card.getUser().getId();
        this.accountId = card.getAccount().getId();
        this.type = card.getType();
        this.maskedNumber = card.getMaskedNumber();
        this.expiryMonth = card.getExpiryMonth();
        this.expiryYear = card.getExpiryYear();
        this.status = card.getStatus();
        this.creditLimit = card.getCreditLimit();
        this.createdAt = card.getCreatedAt();
        this.updatedAt = card.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public Card.CardType getType() { return type; }
    public void setType(Card.CardType type) { this.type = type; }
    
    public String getMaskedNumber() { return maskedNumber; }
    public void setMaskedNumber(String maskedNumber) { this.maskedNumber = maskedNumber; }
    
    public Integer getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(Integer expiryMonth) { this.expiryMonth = expiryMonth; }
    
    public Integer getExpiryYear() { return expiryYear; }
    public void setExpiryYear(Integer expiryYear) { this.expiryYear = expiryYear; }
    
    public Card.CardStatus getStatus() { return status; }
    public void setStatus(Card.CardStatus status) { this.status = status; }
    
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

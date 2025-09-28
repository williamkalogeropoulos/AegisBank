package com.hellenicbank.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
public class Card {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardType type;
    
    @NotBlank
    @Column(name = "masked_number", nullable = false)
    private String maskedNumber;
    
    @Column(name = "expiry_month", nullable = false)
    private Integer expiryMonth;
    
    @Column(name = "expiry_year", nullable = false)
    private Integer expiryYear;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status = CardStatus.ACTIVE;
    
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Card() {}
    
    public Card(Long id, User user, Account account, CardType type, String maskedNumber, Integer expiryMonth, Integer expiryYear, CardStatus status, BigDecimal creditLimit, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.account = account;
        this.type = type;
        this.maskedNumber = maskedNumber;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.status = status;
        this.creditLimit = creditLimit;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
    
    public CardType getType() { return type; }
    public void setType(CardType type) { this.type = type; }
    
    public String getMaskedNumber() { return maskedNumber; }
    public void setMaskedNumber(String maskedNumber) { this.maskedNumber = maskedNumber; }
    
    public Integer getExpiryMonth() { return expiryMonth; }
    public void setExpiryMonth(Integer expiryMonth) { this.expiryMonth = expiryMonth; }
    
    public Integer getExpiryYear() { return expiryYear; }
    public void setExpiryYear(Integer expiryYear) { this.expiryYear = expiryYear; }
    
    public CardStatus getStatus() { return status; }
    public void setStatus(CardStatus status) { this.status = status; }
    
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public enum CardType {
        DEBIT, CREDIT
    }
    
    public enum CardStatus {
        PENDING, ACTIVE, BLOCKED, CANCELLED
    }
}

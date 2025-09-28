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
@Table(name = "transfers")
public class Transfer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", nullable = false)
    private Account fromAccount;
    
    @NotBlank
    @Column(name = "to_iban", nullable = false)
    private String toIban;
    
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false)
    private String currency = "EUR";
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "reference")
    private String reference;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status = TransferStatus.PENDING;
    
    @Column(name = "category")
    private String category;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO;
    
    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferType type = TransferType.EXTERNAL;
    
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
    public Transfer() {}
    
    public Transfer(Long id, Account fromAccount, String toIban, BigDecimal amount, String currency, String description, String reference, TransferStatus status, String category, BigDecimal fee, BigDecimal totalAmount, TransferType type, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fromAccount = fromAccount;
        this.toIban = toIban;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.reference = reference;
        this.status = status;
        this.category = category;
        this.fee = fee;
        this.totalAmount = totalAmount;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Account getFromAccount() { return fromAccount; }
    public void setFromAccount(Account fromAccount) { this.fromAccount = fromAccount; }
    
    public String getToIban() { return toIban; }
    public void setToIban(String toIban) { this.toIban = toIban; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    
    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public TransferType getType() { return type; }
    public void setType(TransferType type) { this.type = type; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public enum TransferStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
    
    public enum TransferType {
        EXTERNAL,    // To external bank
        INTERNAL,    // To another Aegis Bank account (different user)
        INTER_ACCOUNT // To user's own account
    }
}


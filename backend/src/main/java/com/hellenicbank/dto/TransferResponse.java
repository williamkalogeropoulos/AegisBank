package com.hellenicbank.dto;

import com.hellenicbank.entity.Transfer;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransferResponse {
    
    private Long id;
    private Long fromAccountId;
    private String fromAccountIban;
    private String toIban;
    private BigDecimal amount;
    private BigDecimal fee;
    private BigDecimal totalAmount;
    private String currency;
    private String description;
    private String reference;
    private String category;
    private Transfer.TransferStatus status;
    private Transfer.TransferType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public TransferResponse(Transfer transfer) {
        this.id = transfer.getId();
        this.fromAccountId = transfer.getFromAccount().getId();
        this.fromAccountIban = transfer.getFromAccount().getIban();
        this.toIban = transfer.getToIban();
        this.amount = transfer.getAmount();
        this.fee = transfer.getFee() != null ? transfer.getFee() : BigDecimal.ZERO;
        this.totalAmount = transfer.getTotalAmount() != null ? transfer.getTotalAmount() : transfer.getAmount();
        this.currency = transfer.getCurrency();
        this.description = transfer.getDescription();
        this.reference = transfer.getReference();
        this.category = transfer.getCategory();
        this.status = transfer.getStatus();
        this.type = transfer.getType() != null ? transfer.getType() : Transfer.TransferType.EXTERNAL;
        this.createdAt = transfer.getCreatedAt();
        this.updatedAt = transfer.getUpdatedAt();
    }
}

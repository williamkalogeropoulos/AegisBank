package com.hellenicbank.dto;

import com.hellenicbank.entity.Card;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CardStatusUpdateRequest {
    
    @NotNull(message = "Card status is required")
    private Card.CardStatus status;
}

package com.hellenicbank.dto;

import com.hellenicbank.entity.Loan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class LoanStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private Loan.LoanStatus status;
    
    private String adminNotes; // Optional notes from admin
    
    // Getters and Setters
    public Loan.LoanStatus getStatus() { return status; }
    public void setStatus(Loan.LoanStatus status) { this.status = status; }
    
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}

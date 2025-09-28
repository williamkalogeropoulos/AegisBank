package com.hellenicbank.repository;

import com.hellenicbank.entity.Loan;
import com.hellenicbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    // Basic queries
    List<Loan> findByUser(User user);
    List<Loan> findByUserId(Long userId);
    List<Loan> findByStatus(Loan.LoanStatus status);
    
    // User-specific queries
    List<Loan> findByUserIdAndStatus(Long userId, Loan.LoanStatus status);
    List<Loan> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Admin queries
    List<Loan> findByStatusOrderByCreatedAtDesc(Loan.LoanStatus status);
    
    // Search and filter queries
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.principal BETWEEN :minAmount AND :maxAmount ORDER BY l.createdAt DESC")
    List<Loan> findByUserIdAndPrincipalBetween(@Param("userId") Long userId, 
                                               @Param("minAmount") BigDecimal minAmount, 
                                               @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.createdAt BETWEEN :startDate AND :endDate ORDER BY l.createdAt DESC")
    List<Loan> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.purpose LIKE %:purpose% ORDER BY l.createdAt DESC")
    List<Loan> findByUserIdAndPurposeContaining(@Param("userId") Long userId, @Param("purpose") String purpose);
    
    // Admin search queries
    @Query("SELECT l FROM Loan l WHERE l.principal BETWEEN :minAmount AND :maxAmount ORDER BY l.createdAt DESC")
    List<Loan> findByPrincipalBetween(@Param("minAmount") BigDecimal minAmount, 
                                      @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT l FROM Loan l WHERE l.createdAt BETWEEN :startDate AND :endDate ORDER BY l.createdAt DESC")
    List<Loan> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT l FROM Loan l WHERE l.purpose LIKE %:purpose% ORDER BY l.createdAt DESC")
    List<Loan> findByPurposeContaining(@Param("purpose") String purpose);
    
    // Statistics queries
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = :status")
    Long countByStatus(@Param("status") Loan.LoanStatus status);
    
    @Query("SELECT SUM(l.principal) FROM Loan l WHERE l.status = :status")
    BigDecimal sumPrincipalByStatus(@Param("status") Loan.LoanStatus status);
}


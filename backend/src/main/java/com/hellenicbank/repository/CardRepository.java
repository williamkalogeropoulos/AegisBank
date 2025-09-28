package com.hellenicbank.repository;

import com.hellenicbank.entity.Card;
import com.hellenicbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByUser(User user);
    List<Card> findByUserId(Long userId);
    List<Card> findByStatus(Card.CardStatus status);
    void deleteByAccountId(Long accountId);
}


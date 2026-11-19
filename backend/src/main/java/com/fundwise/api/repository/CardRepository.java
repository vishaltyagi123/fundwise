package com.fundwise.api.repository;

import com.fundwise.api.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("SELECT c FROM Card c WHERE c.account.user.id = :userId")
    List<Card> findByUserId(@Param("userId") Long userId);

    List<Card> findByAccountId(Long accountId);

    boolean existsByCardNumber(String cardNumber);
}

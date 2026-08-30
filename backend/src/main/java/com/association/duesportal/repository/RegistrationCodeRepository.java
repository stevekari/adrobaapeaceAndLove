package com.association.duesportal.repository;

import com.association.duesportal.model.RegistrationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, Long> {

    Optional<RegistrationCode> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<RegistrationCode> findAllByOrderByCreatedAtDesc();

    List<RegistrationCode> findByStatusOrderByCreatedAtDesc(String status);

    @Modifying
    @Transactional
    void deleteByPreAssignedMemberId(Long memberId);

    @Modifying
    @Transactional
    void deleteByRedeemedById(Long memberId);
}

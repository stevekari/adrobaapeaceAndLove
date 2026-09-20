package com.association.duesportal.repository;

import com.association.duesportal.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmailIgnoreCase(String email);

    Optional<Member> findByMemberCodeIgnoreCase(String memberCode);

    @Query("SELECT m FROM Member m WHERE LOWER(m.email) = LOWER(:identifier) OR LOWER(m.memberCode) = LOWER(:identifier)")
    Optional<Member> findByIdentifier(@Param("identifier") String identifier);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByMemberCodeIgnoreCase(String memberCode);

    List<Member> findByStatus(String status);

    long countByStatus(String status);

    long countByRole(String role);

    List<Member> findByRole(String role);

    boolean existsByRole(String role);

    @Query("SELECT m FROM Member m WHERE " +
           "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.memberCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Member> searchMembers(@Param("keyword") String keyword);
}

package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {

    Optional<WatchlistEntry> findByEntryId(String entryId);

    List<WatchlistEntry> findByActiveTrue();

    List<WatchlistEntry> findByType(WatchlistEntry.WatchlistType type);

    Page<WatchlistEntry> findByType(WatchlistEntry.WatchlistType type, Pageable pageable);

    List<WatchlistEntry> findByEntityType(WatchlistEntry.EntityType entityType);

    @Query("SELECT w FROM WatchlistEntry w WHERE w.active = true AND " +
           "(LOWER(w.fullName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(w.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(w.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(w.aliasNames) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<WatchlistEntry> searchByName(@Param("name") String name);

    @Query("SELECT COUNT(w) FROM WatchlistEntry w WHERE w.active = true")
    Long countActive();

    @Query("SELECT w.type, COUNT(w) FROM WatchlistEntry w WHERE w.active = true GROUP BY w.type")
    List<Object[]> countByType();
}

package com.fundwise.api.model.compliance;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_id", nullable = false, unique = true)
    private String entryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchlistType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    // Name fields for matching
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "alias_names", columnDefinition = "TEXT")
    private String aliasNames; // Comma-separated

    // Additional identifiers
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private String nationality;

    @Column
    private String country;

    @Column(name = "country_of_residence")
    private String countryOfResidence;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "id_number")
    private String idNumber; // Passport, national ID

    @Column(name = "id_type")
    private String idType;

    // Organization fields
    @Column(name = "organization_name")
    private String organizationName;

    @Column(name = "registration_number")
    private String registrationNumber;

    // Sanctions details
    @Column(name = "sanctions_program")
    private String sanctionsProgram; // OFAC, EU, UN

    @Column(name = "listing_date")
    private LocalDate listingDate;

    @Column(name = "reason_for_listing", columnDefinition = "TEXT")
    private String reasonForListing;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum WatchlistType {
        OFAC_SDN,           // US Treasury OFAC
        UN_SANCTIONS,       // United Nations
        EU_SANCTIONS,       // European Union
        UK_SANCTIONS,       // UK HMT
        PEP,               // Politically Exposed Person
        ADVERSE_MEDIA,      // Negative news
        INTERNAL_BLOCKLIST, // Internal watchlist
        INTERNAL            // Alias for internal
    }

    public enum EntityType {
        INDIVIDUAL,
        ORGANIZATION,
        VESSEL,
        AIRCRAFT
    }
}
package com.dementiascreen.service;

import com.dementiascreen.dto.PersonRequest;
import com.dementiascreen.dto.PersonResponse;
import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.Screening;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.ResourceNotFoundException;
import com.dementiascreen.repository.PersonRepository;
import com.dementiascreen.repository.ScreeningHistoryRepository;
import com.dementiascreen.repository.ScreeningRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final ScreeningRepository screeningRepository;
    private final ScreeningHistoryRepository screeningHistoryRepository;

    public PersonService(PersonRepository personRepository, ScreeningRepository screeningRepository,
                          ScreeningHistoryRepository screeningHistoryRepository,
                          com.dementiascreen.security.AccessGuard accessGuard) {
        this.personRepository = personRepository;
        this.screeningRepository = screeningRepository;
        this.screeningHistoryRepository = screeningHistoryRepository;
        this.accessGuard = accessGuard;
    }

    private final com.dementiascreen.security.AccessGuard accessGuard;

    public PersonResponse register(PersonRequest req) {
        User currentUser = currentUser();

        Person person = Person.builder()
                .fullName(req.getFullName())
                .age(req.getAge())
                .gender(Person.Gender.valueOf(req.getGender()))
                .phone(req.getPhone())
                .location(req.getLocation())
                .emergencyContactName(req.getEmergencyContactName())
                .emergencyContactPhone(req.getEmergencyContactPhone())
                .consentGiven(req.getConsentGiven())
                .registeredBy(currentUser.getId())
                .build();

        Person saved = personRepository.save(person);
        return toResponse(saved);
    }

    public List<PersonResponse> listAll() {
        User currentUser = currentUser();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        return personRepository.findAll().stream()
                .filter(p -> admin || currentUser.getId().equals(p.getRegisteredBy()))
                .sorted(Comparator.comparing(Person::getCreatedAt).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PersonResponse> search(String query) {
        // Simple linear filter over an in-memory list — appropriate at
        // clinic-scale data volumes and keeps search logic transparent.
        // Scoped to the authenticated specialist's own patients (IDOR protection).
        if (query == null || query.isBlank()) {
            return listAll();
        }
        User currentUser = currentUser();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        String lower = query.toLowerCase();
        return personRepository.findAll().stream()
                .filter(p -> admin || currentUser.getId().equals(p.getRegisteredBy()))
                .filter(p -> p.getFullName().toLowerCase().contains(lower))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PersonResponse getById(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + id));
        // Server-side authorization: specialists may only open their own patients.
        accessGuard.assertPersonAccess(person);
        return toResponse(person);
    }

    private PersonResponse toResponse(Person p) {
        List<Screening> screenings = screeningRepository.findByPersonIdOrderByStartedAtDesc(p.getId());
        String lastStatus = null;
        java.time.LocalDateTime lastDate = null;
        if (!screenings.isEmpty()) {
            Screening latest = screenings.get(0);
            lastDate = latest.getCompletedAt() != null ? latest.getCompletedAt() : latest.getStartedAt();
            var history = screeningHistoryRepository.findByPersonIdOrderByRecordedAtAsc(p.getId());
            if (!history.isEmpty()) {
                lastStatus = history.get(history.size() - 1).getOverallStatus().name();
            }
        }

        return PersonResponse.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .age(p.getAge())
                .gender(p.getGender().name())
                .phone(p.getPhone())
                .location(p.getLocation())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .createdAt(p.getCreatedAt())
                .lastScreeningStatus(lastStatus)
                .lastScreeningDate(lastDate)
                .build();
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

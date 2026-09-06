package com.dementiascreen.service;

import com.dementiascreen.dto.FollowUpRequest;
import com.dementiascreen.dto.FollowUpResponse;
import com.dementiascreen.entity.FollowUp;
import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.ResourceNotFoundException;
import com.dementiascreen.repository.FollowUpRepository;
import com.dementiascreen.repository.PersonRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final PersonRepository personRepository;

    public FollowUpService(FollowUpRepository followUpRepository, PersonRepository personRepository,
                           com.dementiascreen.security.AccessGuard accessGuard) {
        this.followUpRepository = followUpRepository;
        this.personRepository = personRepository;
        this.accessGuard = accessGuard;
    }

    private final com.dementiascreen.security.AccessGuard accessGuard;

    public FollowUpResponse create(FollowUpRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + request.getPersonId()));
        // Server-side authorization: only the patient's specialist can create follow-ups.
        accessGuard.assertPersonAccess(person);

        FollowUp followUp = FollowUp.builder()
                .personId(person.getId())
                .screeningId(request.getScreeningId())
                .createdBy(currentUser.getId())
                .status(FollowUp.Status.PENDING)
                .reason(request.getReason())
                .scheduledDate(request.getScheduledDate())
                .notes(request.getNotes())
                .build();

        FollowUp saved = followUpRepository.save(followUp);
        return toResponse(saved, person.getFullName());
    }

    public List<FollowUpResponse> listAll() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean admin = currentUser.getRole() == User.Role.ADMIN;
        return followUpRepository.findAll().stream()
                .filter(f -> admin || currentUser.getId().equals(f.getCreatedBy()))
                .map(f -> {
                    String name = personRepository.findById(f.getPersonId())
                            .map(Person::getFullName).orElse("Unknown");
                    return toResponse(refreshOverdue(f), name);
                })
                .collect(Collectors.toList());
    }

    public FollowUpResponse updateStatus(Long id, String status) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found: " + id));
        // Server-side authorization: only the creator (or an admin) may update.
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser.getRole() != User.Role.ADMIN && !currentUser.getId().equals(followUp.getCreatedBy())) {
            throw new ResourceNotFoundException("Follow-up not found: " + id);
        }
        followUp.setStatus(FollowUp.Status.valueOf(status));
        FollowUp saved = followUpRepository.save(followUp);
        String name = personRepository.findById(saved.getPersonId()).map(Person::getFullName).orElse("Unknown");
        return toResponse(saved, name);
    }

    // Marks a PENDING/SCHEDULED follow-up as OVERDUE if its scheduled date has passed.
    private FollowUp refreshOverdue(FollowUp f) {
        if ((f.getStatus() == FollowUp.Status.PENDING || f.getStatus() == FollowUp.Status.SCHEDULED)
                && f.getScheduledDate() != null && f.getScheduledDate().isBefore(LocalDate.now())) {
            f.setStatus(FollowUp.Status.OVERDUE);
            followUpRepository.save(f);
        }
        return f;
    }

    private FollowUpResponse toResponse(FollowUp f, String personName) {
        return FollowUpResponse.builder()
                .id(f.getId())
                .personId(f.getPersonId())
                .personName(personName)
                .status(f.getStatus().name())
                .reason(f.getReason())
                .scheduledDate(f.getScheduledDate())
                .createdAt(f.getCreatedAt())
                .build();
    }
}

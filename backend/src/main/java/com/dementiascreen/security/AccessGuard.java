package com.dementiascreen.security;

import com.dementiascreen.entity.Person;
import com.dementiascreen.entity.Screening;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.ResourceNotFoundException;
import com.dementiascreen.repository.PersonRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Central server-side authorization guard.
 *
 * Identity and permissions are ALWAYS derived from the authenticated Spring
 * Security context — never from any id/role/email supplied by the client.
 * Ownership checks throw ResourceNotFoundException (HTTP 404) instead of 403
 * so the API does not leak the existence of other users' records.
 */
@Component
public class AccessGuard {

    private final PersonRepository personRepository;

    public AccessGuard(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    /** Authenticated user from the security context; never trusts client input. */
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new ResourceNotFoundException("Resource not found");
    }

    public boolean isAdmin(User user) {
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    /** ADMIN users may access all records; others only their own patients. */
    public void assertPersonAccess(Person person) {
        User user = currentUser();
        if (isAdmin(user)) return;
        if (!user.getId().equals(person.getRegisteredBy())) {
            throw new ResourceNotFoundException("Person not found: " + person.getId());
        }
    }

    public void assertPersonAccess(Long personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + personId));
        assertPersonAccess(person);
    }

    /** A screening is accessible to its conductor, the patient's owner, or an ADMIN. */
    public void assertScreeningAccess(Screening screening) {
        User user = currentUser();
        if (isAdmin(user)) return;
        if (user.getId().equals(screening.getConductedBy())) return;
        assertPersonAccess(screening.getPersonId());
    }
}

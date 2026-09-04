package com.dementiascreen.dsa;

import java.util.List;

public class RankedPerson {
    public final Long personId;
    public final String personName;
    public final int score;
    public final String level; // HIGH, MEDIUM, LOW
    public final List<String> reasons;

    public RankedPerson(Long personId, String personName, int score, String level, List<String> reasons) {
        this.personId = personId;
        this.personName = personName;
        this.score = score;
        this.level = level;
        this.reasons = reasons;
    }
}

package com.association.duesportal.util;

import java.security.SecureRandom;
import java.time.Year;

public class CodeGeneratorUtil {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous characters (no 0, O, 1, I)
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a distinctive, high-security, unique association code.
     * Example: ASSOC-2026-K8P2-4912, MEM-2026-X7M4-8831, ADM-2026-9F3K-1042
     */
    public static String generateSpecialCode(String prefix) {
        String cleanPrefix = (prefix != null && !prefix.trim().isEmpty())
                ? prefix.trim().toUpperCase().replaceAll("[^A-Z0-9]", "")
                : "ASSOC";

        int currentYear = Year.now().getValue();

        StringBuilder segment1 = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            segment1.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }

        int numberPart = 1000 + RANDOM.nextInt(9000);

        return String.format("%s-%d-%s-%d", cleanPrefix, currentYear, segment1, numberPart);
    }
}


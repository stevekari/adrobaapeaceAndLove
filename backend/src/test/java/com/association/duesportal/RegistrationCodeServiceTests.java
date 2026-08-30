package com.association.duesportal;

import com.association.duesportal.dto.AuthResponseDTO;
import com.association.duesportal.dto.GenerateCodeRequestDTO;
import com.association.duesportal.dto.RedeemCodeRequestDTO;
import com.association.duesportal.dto.RegistrationCodeDTO;
import com.association.duesportal.service.RegistrationCodeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class RegistrationCodeServiceTests {

    @Autowired
    private RegistrationCodeService registrationCodeService;

    @Test
    void testGetAllCodes() {
        registrationCodeService.generateCodes(new GenerateCodeRequestDTO(
                "TEST", "MEMBER", 1, "Testing get all codes", null
        ));

        List<RegistrationCodeDTO> codes = registrationCodeService.getAllCodes();
        assertNotNull(codes);
        assertFalse(codes.isEmpty());
    }

    @Test
    void testGenerateBatchCodes() {
        GenerateCodeRequestDTO req = new GenerateCodeRequestDTO(
                "ASSOC",
                "MEMBER",
                3,
                "Unit Test Batch Codes",
                null
        );

        List<RegistrationCodeDTO> created = registrationCodeService.generateCodes(req);
        assertEquals(3, created.size());
        for (RegistrationCodeDTO dto : created) {
            assertTrue(dto.getCode().startsWith("ASSOC-"));
            assertEquals("AVAILABLE", dto.getStatus());
        }
    }

    @Test
    void testVerifyAndRedeemOpenAssociationCode() {
        // 1. Generate single code
        GenerateCodeRequestDTO req = new GenerateCodeRequestDTO(
                "ASSOC",
                "MEMBER",
                1,
                "Test Open Code",
                null
        );
        List<RegistrationCodeDTO> generated = registrationCodeService.generateCodes(req);
        String code = generated.get(0).getCode();

        // 2. Verify code
        RegistrationCodeDTO verified = registrationCodeService.verifyCode(code);
        assertNotNull(verified);
        assertEquals("AVAILABLE", verified.getStatus());

        // 3. Redeem code with new member details
        RedeemCodeRequestDTO redeemReq = new RedeemCodeRequestDTO(
                code,
                "Kojo",
                "Mensah",
                "kojo.mensah." + System.currentTimeMillis() + "@association.org",
                "+233 24 999 1111",
                "Plot 12, Adum",
                "Kumasi",
                "Architect",
                "securePass123"
        );

        AuthResponseDTO authResponse = registrationCodeService.redeemCode(redeemReq);
        assertNotNull(authResponse);
        assertEquals("Kojo Mensah", authResponse.getFullName());
        assertEquals("Kumasi", authResponse.getCity());

        // 4. Verify code is now marked REDEEMED
        assertThrows(IllegalArgumentException.class, () -> registrationCodeService.verifyCode(code));

        // 5. Verify a DIFFERENT person trying to redeem the SAME code is strictly rejected!
        RedeemCodeRequestDTO secondPersonReq = new RedeemCodeRequestDTO(
                code,
                "Different",
                "Person",
                "different.person." + System.currentTimeMillis() + "@association.org",
                "+233 20 111 2233",
                "Osu",
                "Accra",
                "Teacher",
                "anotherPass123"
        );
        Exception ex = assertThrows(IllegalArgumentException.class, () -> registrationCodeService.redeemCode(secondPersonReq));
        assertTrue(ex.getMessage().contains("already been redeemed"));
    }
}

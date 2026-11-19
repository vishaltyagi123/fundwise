package com.fundwise.api.controller;

import com.fundwise.api.dto.DashboardSummary;
import com.fundwise.api.dto.UserDto;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(dashboardService.getDashboardSummary(user.getId()));
    }

    @GetMapping("/quick-transfer-users")
    public ResponseEntity<List<UserDto>> getQuickTransferUsers(@AuthenticationPrincipal UserDetails userDetails) {
        // Return list of users for quick transfer (excluding current user)
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserDto> users = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .limit(6)
                .map(UserDto::fromEntity)
                .toList();

        return ResponseEntity.ok(users);
    }
}

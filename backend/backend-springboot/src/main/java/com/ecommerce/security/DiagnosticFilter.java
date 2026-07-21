package com.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

@Component
public class DiagnosticFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            System.out.println("[DIAG] Before chain - URI=" + request.getRequestURI() + " auth=" + SecurityContextHolder.getContext().getAuthentication());
            filterChain.doFilter(request, response);
        } finally {
            System.out.println("[DIAG] After chain - URI=" + request.getRequestURI() + " auth=" + SecurityContextHolder.getContext().getAuthentication());
        }
    }
}

package com.altera.teacherservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    private static final String TITLE = "Teacher Service API";
    private static final String DESCRIPTION = "API documentation for Teacher Service in Altera School Management System";
    private static final String VERSION = "1.0.0";
    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
            .components(
                new Components()
                    .addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                            .name(BEARER_AUTH)
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                    )
            )
            .info(new Info()
                .title(TITLE)
                .description(DESCRIPTION)
                .version(VERSION)
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                )
            )
            .servers(List.of(
                new Server()
                    .url("/api/teacher-service")
                    .description("Teacher Service API")
            ));
    }

    @Bean
    public GroupedOpenApi allApis() {
        return GroupedOpenApi.builder()
            .group("all")
            .packagesToScan("com.altera.teacherservice.controller")
            .pathsToMatch("/**")
            .build();
    }

    @Bean
    public GroupedOpenApi authApis() {
        return GroupedOpenApi.builder()
            .group("authentication")
            .packagesToScan("com.altera.teacherservice.controller")
            .pathsToMatch(
                "/api/v1/auth/**"
            )
            .build();
    }

    @Bean
    public GroupedOpenApi publicApis() {
        return GroupedOpenApi.builder()
            .group("public")
            .packagesToScan("com.altera.teacherservice.controller")
            .pathsToMatch(
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/swagger-resources/**",
                "/webjars/**"
            )
            .build();
    }
}

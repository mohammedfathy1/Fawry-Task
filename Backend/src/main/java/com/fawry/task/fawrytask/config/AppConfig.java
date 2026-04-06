package com.fawry.task.fawrytask.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${mealdb.api.base-url}")
    private String mealDbBaseUrl;

    @Bean
    public RestClient mealDbRestClient() {
        return RestClient.builder()
                .baseUrl(mealDbBaseUrl)
                .build();
    }
}



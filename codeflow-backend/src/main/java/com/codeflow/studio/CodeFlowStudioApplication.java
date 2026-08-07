package com.codeflow.studio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CodeFlowStudioApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeFlowStudioApplication.class, args);
    }
}

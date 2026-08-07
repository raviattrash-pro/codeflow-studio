package com.codeflow.studio.dto;

public class GithubIngestRequestDto {
    private String githubUrl;
    private String branch;

    public GithubIngestRequestDto() {}

    public GithubIngestRequestDto(String githubUrl, String branch) {
        this.githubUrl = githubUrl;
        this.branch = branch;
    }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
}

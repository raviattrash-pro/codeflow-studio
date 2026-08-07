package com.codeflow.studio.dto;

import com.codeflow.studio.model.ProjectNode;
import java.util.List;

public class NodeDetailDto {

    private ProjectNode node;
    private List<ProjectNode> calledBy;
    private List<ProjectNode> calls;
    private EducationalExplanation educationalContext;

    public NodeDetailDto() {}

    public NodeDetailDto(ProjectNode node, List<ProjectNode> calledBy, List<ProjectNode> calls, EducationalExplanation educationalContext) {
        this.node = node;
        this.calledBy = calledBy;
        this.calls = calls;
        this.educationalContext = educationalContext;
    }

    public ProjectNode getNode() { return node; }
    public void setNode(ProjectNode node) { this.node = node; }

    public List<ProjectNode> getCalledBy() { return calledBy; }
    public void setCalledBy(List<ProjectNode> calledBy) { this.calledBy = calledBy; }

    public List<ProjectNode> getCalls() { return calls; }
    public void setCalls(List<ProjectNode> calls) { this.calls = calls; }

    public EducationalExplanation getEducationalContext() { return educationalContext; }
    public void setEducationalContext(EducationalExplanation educationalContext) { this.educationalContext = educationalContext; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private ProjectNode node;
        private List<ProjectNode> calledBy;
        private List<ProjectNode> calls;
        private EducationalExplanation educationalContext;

        public Builder node(ProjectNode node) { this.node = node; return this; }
        public Builder calledBy(List<ProjectNode> calledBy) { this.calledBy = calledBy; return this; }
        public Builder calls(List<ProjectNode> calls) { this.calls = calls; return this; }
        public Builder educationalContext(EducationalExplanation educationalContext) { this.educationalContext = educationalContext; return this; }

        public NodeDetailDto build() {
            return new NodeDetailDto(node, calledBy, calls, educationalContext);
        }
    }

    public static class EducationalExplanation {
        private String purpose;
        private List<String> interviewQuestions;
        private String frameworkRole;

        public EducationalExplanation() {}

        public EducationalExplanation(String purpose, List<String> interviewQuestions, String frameworkRole) {
            this.purpose = purpose;
            this.interviewQuestions = interviewQuestions;
            this.frameworkRole = frameworkRole;
        }

        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }

        public List<String> getInterviewQuestions() { return interviewQuestions; }
        public void setInterviewQuestions(List<String> interviewQuestions) { this.interviewQuestions = interviewQuestions; }

        public String getFrameworkRole() { return frameworkRole; }
        public void setFrameworkRole(String frameworkRole) { this.frameworkRole = frameworkRole; }

        public static EduBuilder builder() { return new EduBuilder(); }

        public static class EduBuilder {
            private String purpose;
            private List<String> interviewQuestions;
            private String frameworkRole;

            public EduBuilder purpose(String purpose) { this.purpose = purpose; return this; }
            public EduBuilder interviewQuestions(List<String> interviewQuestions) { this.interviewQuestions = interviewQuestions; return this; }
            public EduBuilder frameworkRole(String frameworkRole) { this.frameworkRole = frameworkRole; return this; }

            public EducationalExplanation build() {
                return new EducationalExplanation(purpose, interviewQuestions, frameworkRole);
            }
        }
    }
}

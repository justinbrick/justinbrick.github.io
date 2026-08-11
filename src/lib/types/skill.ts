export type Skill = {
    /** the name of the skill. */
    skill: string,
    /** a list of categories this skill could fit under. */
    categories: string[],
    /** the competency level of the skill. */
    competency: Competency,
    /** a list of statements that I could make about this skill. */
    statements: string[],
    /** a specific credential used to verify a skill claim */
    credential: Credential
}

/** used to help quantify the competency level of a specific skill. */
export type Competency = {
    /** defines a ranking, from 1-5. mutually exclusive with {@link Competency.label}. */
    ranking?: number,
    /** defines a label for unquantifiable determinations. mutually exclusive with {@link Competency.ranking}. */
    label?: string
}

/** a reference to some source which can help validate a claimed skill. */
export type Credential = {
    /** the name of the credential, such as a verified certificate vendor, or a specific object. */
    name: string,
    /** a description of the credential, which may include justification for it's inclusion. */
    description: string,
    /** a link to the credential itself, formatted as a valid HTTPS url. */
    link: string
}
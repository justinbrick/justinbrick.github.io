<script lang="ts">
    import PersonalSkill from "./skill.svelte";
    import type { Skill } from "$lib/types/skill";
    import skillData from "$lib/information/skills.json";
    const skills = (skillData as Skill[])
        .sort(
            (sk1, sk2) =>
                (sk1.competency.ranking ?? 3) - (sk2.competency.ranking ?? 3),
        )
        .reverse();
    const categories = new Set(skills.flatMap((s) => s.categories));

    let skillSearch = $state("");
    let applicableCategories = $derived(
        [...categories].filter((category) =>
            category.toLowerCase().includes(skillSearch),
        ),
    );
    let selectedCategories: string[] = $state([]);
    let applicableSkills = $derived(
        selectedCategories.length == 0
            ? skills.slice(0, 5)
            : skills.filter((skill) =>
                  skill.categories.some((category) =>
                      selectedCategories.includes(category),
                  ),
              ),
    );
</script>

<p><em>I'm looking for someone that's skilled in...</em></p>
<input
    bind:value={skillSearch}
    type="search"
    placeholder="Enter a category name"
    aria-label="Enter names for categories you're interested in narrowing down to."
/>
<fieldset role="group" class="wrap">
    {#each applicableCategories as category}
        <label>
            <input
                bind:group={selectedCategories}
                value={category}
                type="checkbox"
            />
            {category}
        </label>
    {/each}
</fieldset>
{#each applicableSkills as skill}
    <PersonalSkill {...skill} />
{/each}

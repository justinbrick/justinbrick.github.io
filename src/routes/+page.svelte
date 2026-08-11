<script>
    import SkillBrowser from "$lib/components/skillBrowser.svelte";
</script>

<hgroup>
    <h1>Hi.</h1>
    <p>My name is Justin.</p>
</hgroup>

<h2>Who Am I</h2>

<p>
    I'm an engineer who's been making software for a decent enough chunk of
    time.
</p>

<details name="qualifications" open>
    <summary>Qualifications</summary>
    <p>
        I've got a lot of qualifications. Some of them are good. Some not so
        much.
    </p>
    <p>
        If you're looking to hire or commission, feel free to search based on
        what you're looking for.
    </p>
    <hr />
    <SkillBrowser />
</details>

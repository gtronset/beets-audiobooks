//function

module.exports = async ({github, context, core}) => {
        try {

        const {PROJECT_VERSION, LSIO_VERSION, BA_VERSION} = process.env;

        console.log(PROJECT_VERSION, LSIO_VERSION, BA_VERSION);
        const latest_release_response = await github.rest.repos.getLatestRelease({
            owner: context.repo.owner,
            repo: context.repo.repo,
        });

        const latest_release_tag_name = latest_release_response.data.tag_name;

        console.log(latest_release_tag_name);

        const compare_commits_response = await github.rest.repos.compareCommitsWithBasehead({
            owner: context.repo.owner,
            repo: context.repo.repo,
            basehead: `${latest_release_tag_name}...HEAD`,
        });

        const total_commits = compare_commits_response.data.total_commits;
        const commits = compare_commits_response.data.commits;

        if (total_commits === 0){
            console.log(`No new commits since last release (${latest_release_tag_name}).`);
            return;
        }

        console.log("Commits since last release: ", total_commits);

        const new_ba_version = parseInt(BA_VERSION) + 1;
        console.log(new_ba_version);

        const new_tag_name = `v${PROJECT_VERSION}-ba${new_ba_version}`;
        console.log(new_tag_name);

        const response = await github.rest.repos.generateReleaseNotes({
            owner: context.repo.owner,
            repo: context.repo.repo,
            tag_name: new_tag_name,
        });

        const generated_release_notes = response.data.body

        const new_release_notes = `# Release Notes (${new_tag_name})\n\n` +
            `## Version Info\n` +
            `* [Beets](https://github.com/beetbox/beets): \`v${PROJECT_VERSION}\`\n` +
            `* [LinuxServer \`docker-beets\`](https://github.com/linuxserver/docker-beets):` +
            ` \`${PROJECT_VERSION}-ls${LSIO_VERSION}\`\n` +
            `* \`beets-audiobook\` release: \`${new_ba_version}\`` +
            `\n\n` +
            generated_release_notes

        console.log(new_release_notes)
    } catch (error) {
        core.setFailed(error.message);
    }


    // try {
    //     await github.rest.repos.createRelease({
    //         draft: false,
    //         generate_release_notes: true,
    //         name: process.env.RELEASE_TAG,
    //         owner: context.repo.owner,
    //         prerelease: false,
    //         repo: context.repo.repo,
    //         tag_name: process.env.RELEASE_TAG,
    //     });
    // } catch (error) {
    //     core.setFailed(error.message);
    // }
}

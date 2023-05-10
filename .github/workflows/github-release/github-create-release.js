module.exports = async ({github, context, core}) => {
    try {

        const {owner, repo} = context.repo;
        const {NEW_BA_VERSION, PROJECT_VERSION, LSIO_VERSION, TAG_NAME} = process.env;

        const generated_notes_response = await github.rest.repos.generateReleaseNotes({
            owner: owner,
            repo: repo,
            tag_name: TAG_NAME,
        });

        const generated_release_notes = generated_notes_response.data.body

        const new_release_notes = `# Release Notes (${TAG_NAME})\n\n` +
            `## Version Info\n` +
            `* [Beets](https://github.com/beetbox/beets): \`v${PROJECT_VERSION}\`\n` +
            `* [LinuxServer \`docker-beets\`](https://github.com/linuxserver/docker-beets):` +
            ` \`${PROJECT_VERSION}-ls${LSIO_VERSION}\`\n` +
            `* \`beets-audiobook\` release: \`${NEW_BA_VERSION}\`` +
            `\n\n` +
            generated_release_notes

        core.exportVariable('RELEASE_NOTES', new_release_notes);

    } catch (error) {
        core.setFailed(error.message);
    }

    try {
        await github.rest.repos.createRelease({
            draft: false,
            generate_release_notes: true,
            name: process.env.RELEASE_TAG,
            owner: context.repo.owner,
            prerelease: false,
            repo: context.repo.repo,
            tag_name: process.env.RELEASE_TAG,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

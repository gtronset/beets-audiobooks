const yaml = require('js-yaml');
const fs   = require('fs');

module.exports = async ({github, context, core}) => {
    const yamlContents = yaml.load(fs.readFileSync(versionFile, 'utf8'));
    const {project_version, ba_version, lsio_version, current_release} = yamlContents;

    try {

        const {owner, repo} = context.repo;
        const versionFile = "repo-vars.yaml";

        const generated_notes_response = await github.rest.repos.generateReleaseNotes({
            owner: owner,
            repo: repo,
            tag_name: current_release,
        });

        const generated_release_notes = generated_notes_response.data.body

        const new_release_notes = `# Release Notes (${current_release})\n\n` +
            `## Version Info\n` +
            `* [Beets](https://github.com/beetbox/beets): \`v${project_version}\`\n` +
            `* [LinuxServer \`docker-beets\`](https://github.com/linuxserver/docker-beets):` +
            ` \`${project_version}-ls${lsio_version}\`\n` +
            `* \`beets-audiobook\` release: \`${ba_version}\`` +
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
            name: current_release,
            owner: context.repo.owner,
            prerelease: false,
            repo: context.repo.repo,
            tag_name: current_release,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

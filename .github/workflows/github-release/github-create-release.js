const yaml = require('js-yaml');
const fs   = require('fs');

module.exports = async ({github, context, core}) => {
    const versionFile = "version.yaml";

    const yamlContents = yaml.load(fs.readFileSync(versionFile, 'utf8'));
    const {project_version, ba_version, lsio_version, current_release} = yamlContents;

    try {
        const releaseBody = `# Release Notes (${current_release})\n\n` +
            `## Version Info\n` +
            `* [Beets](https://github.com/beetbox/beets): \`v${project_version}\`\n` +
            `* [LinuxServer \`docker-beets\`](https://github.com/linuxserver/docker-beets):` +
            ` \`${project_version}-ls${lsio_version}\`\n` +
            `* \[\`beets-audiobook\`](https://github.com/gtronset/beets-audiobooks) release: \`${ba_version}\` (\`ba${ba_version}\`)` +
            `\n\n`;

        await github.rest.repos.createRelease({
            draft: false,
            generate_release_notes: true,
            body: releaseBody,
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

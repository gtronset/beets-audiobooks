module.exports = async ({github, context, core}) => {
    try {

        const {owner, repo} = context.repo;
        const {PROJECT_VERSION, BA_VERSION} = process.env;

        const latest_release_response = await github.rest.repos.getLatestRelease({
            owner: owner,
            repo: repo,
        });

        const latest_release_tag_name = latest_release_response.data.tag_name;

        console.log("Latest release: ", latest_release_tag_name);

        const compare_commits_response = await github.rest.repos.compareCommitsWithBasehead({
            owner: owner,
            repo: repo,
            basehead: `${latest_release_tag_name}...HEAD`,
        });

        const total_commits = compare_commits_response.data.total_commits;
        const commits = compare_commits_response.data.commits;

        if (total_commits === 0){
            console.log(`No new commits since last release (${latest_release_tag_name}).`);
            return;
        }

        core.exportVariable('RELEASE_NEEDED', true);
        core.exportVariable('OLD_TAG_NAME', latest_release_tag_name);

        console.log("Commits since last release: ", total_commits);

        const new_ba_version = parseInt(BA_VERSION) + 1;

        core.exportVariable('NEW_BA_VERSION', new_ba_version);

        const new_tag_name = `v${PROJECT_VERSION}-ba${new_ba_version}`;
        console.log("New release tag: ", new_tag_name);

        core.exportVariable('TAG_NAME', new_tag_name);

    } catch (error) {
        core.setFailed(error.message);
    }

}

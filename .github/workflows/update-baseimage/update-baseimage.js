const yaml = require('js-yaml');
const fs   = require('fs');

module.exports = async ({github, context, core}) => {
    try {

        const baseimageOwner = "linuxserver";
        const baseimageRepo = "docker-beets";
        const versionFile = "repo-vars.yaml";
        const dockerfile = "Dockerfile";

        const yamlContents = yaml.load(fs.readFileSync(versionFile, 'utf8'));

        const {project_version, lsio_version} = yamlContents;

        const latest_release_response = await github.rest.repos.getLatestRelease({
            owner: baseimageOwner,
            repo: baseimageRepo,
        });

        const latest_release_tag_name = latest_release_response.data.tag_name;
        const latest_release_url = latest_release_response.data.html_url;
        const latest_release_body = latest_release_response.data.body;

        core.exportVariable('EXT_RELEASE_TAG', latest_release_tag_name);
        core.exportVariable('EXT_RELEASE_URL', latest_release_url);
        core.exportVariable('EXT_RELEASE_BODY', latest_release_body);

        const imageTagRegexPrefix = `${project_version.replaceAll(".", "\\.")}-ls`;
        const version_regex = new RegExp(`${imageTagRegexPrefix}([0-9]+)`);
        const latest_release_version = latest_release_tag_name.match(version_regex)[1];

        console.log(`Existing/local version: ${project_version}-ls${lsio_version} | Remote version: ${latest_release_tag_name}`);

        if(lsio_version !== latest_release_version){
            console.log("BaseImage version update. Updating...");

            /* Update the Version File */
            yamlContents.lsio_version = parseInt(latest_release_version);
            fs.writeFileSync(versionFile, yaml.dump(yamlContents));

            /* Update the Dockerfile */
            fs.readFile(dockerfile, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }

                const dockerRegex = new RegExp(`${imageTagRegexPrefix}${lsio_version}`, "g")
                const result = data.replace(dockerRegex, latest_release_tag_name);

                fs.writeFile(dockerfile, result, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

            console.log("Updated Version file and Dockerfile.");
        } else {
            console.log("BaseImage is already up-to-date.");
        }

    } catch (error) {
        core.setFailed(error.message);
    }

}

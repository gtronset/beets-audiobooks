const yaml = require('js-yaml');
const fs   = require('fs');

module.exports = async ({github, context, core}) => {
    let baseimage_update_required = false;

    try {

        const baseimageOwner = "linuxserver";
        const baseimageRepo = "docker-beets";
        const versionFile = "version.yaml";
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

        const version_regex = new RegExp(`([0-9]+\.[0-9]+\.[0-9]+)-ls([0-9]+)`);
        const latest_release_versions = latest_release_tag_name.match(version_regex);

        /*
        const version_regex = new RegExp(`([0-9]+\.[0-9]+)-[0-9a-f]{8}-ls([0-9]+)`);
        const latest_release_versions = latest_release_tag_name.match(version_regex);

        console.log(`Existing/local version: ${alpine_version}-ls${lsio_version} | `
          + `Remote version: ${latest_release_versions[1]}-ls${latest_release_versions[2]}`);

        if(alpine_version !== latest_release_versions[1] || lsio_version !== latest_release_versions[2]){
            */

        console.log(`Existing/local version: ${project_version}-ls${lsio_version} | Remote version: ${latest_release_versions[1]}-ls${latest_release_versions[2]}`);

        if(project_version !== latest_release_versions[1] || lsio_version !== latest_release_versions[2]){
            baseimage_update_required = true;

            console.log("BaseImage version update. Updating...");

            core.exportVariable('EXT_RELEASE_TAG', latest_release_tag_name);
            core.exportVariable('EXT_RELEASE_URL', latest_release_url);
            core.exportVariable('EXT_RELEASE_BODY', latest_release_body);

            /* Update the Version File */
            yamlContents.project_version = latest_release_versions[1];
            yamlContents.lsio_version = parseInt(latest_release_versions[2]);
            fs.writeFileSync(versionFile, yaml.dump(yamlContents));

            console.log(yamlContents)

            /* Update the Dockerfile */
            fs.readFile(dockerfile, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }

                const result = data.replace(version_regex, latest_release_tag_name);

                fs.writeFile(dockerfile, result, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });

            console.log("Updated Version file and Dockerfile.");
        } else {
            console.log("BaseImage is already up-to-date.");
        }


        core.exportVariable('UPDATE_REQUIRED', baseimage_update_required);

    } catch (error) {
        core.setFailed(error.message);
    }

}

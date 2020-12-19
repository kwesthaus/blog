/**
 * Project config for your site.
 * All variables declared in `meta` will be accessible in your Nunjucks
 * templates. Variables changed in `config` affect the build process.
 *
 */
module.exports = {
    // The `meta` object is sent to every template.
    meta: {
        title: "Kyle Westhaus",
        description: "A blog about topics which interest Kyle Westhaus, an Eagle Scout and student at The Ohio State University. Expect security research, Linux configuration, ultralight backpacking, and modern adventuring content.",
        author: "kwesthaus",
    },
    // All authors must be defined here.
    authors: {
        "kwesthaus": {
            name: "Kyle Westhaus",
            short_bio: "Security Researcher, Astronomer, Cartographer, Adventurer, CSE Student at The Ohio State University",
            bio: ""
        }
    },
    config: {

    },
}

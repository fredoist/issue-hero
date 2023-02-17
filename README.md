# Issue Hero `(alpha)`

Efficiently handle issues with AI-powered automation for summaries, labels, and spam filtering.

## Get started
1. Install the [Issue Hero GitHub App](https://github.com/apps/issue-hero).
2. Add your own configuration by creating a `.github/issue-hero.yml` file with the following contents:
    ```yaml
    # All fields are optional, you can skip them and it'll use the default values.
    summary:
      enabled: true # {boolean} Wheter if you want to create a summary of the issue
      threshold: 100 # {number} Specify the length of the summary

    spam:
      enabled: true # {boolean} Wheter if you want to enable spam filtering
      notify: [] # {string[]} An array of usernames to tag when an issue is flagged (do not include @ symbol)
      close: true # {boolean} wheter if you want to automatically close flagged issues
      confidence: 0.85 # {number (range 0 - 1)} minimum required confidence for the model

    label:
      enabled: true # {boolean} Wheter if you want to enable automatic labelling for issues
      confidence: 0.85 # {number (range 0 - 1)} minimun confidence for the model (ex. bug label with confidence of 0.80 will not be applied)
    ```
### Feedback
Please [open an issue](https://github.com/fredoist/issue-hero/issues/new) to report bugs, give feedback, or request a feature.

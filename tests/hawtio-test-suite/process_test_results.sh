echo "# Test results "
echo "Run attempt: $GITHUB_RUN_NUMBER"
echo "[Detailed summary]($CHECK_URL)"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo "| NAME | TESTS | PASSED ✅ | SKIPPED 💤 | FAILED ❌ | ERRORS 🚫 | TIME 🕖 |"
echo "| --- | --- | --- | --- | --- | --- | --- |"
for i in $1/*; do 
    if [ -f "$i/Cucumber.xml" ]; then
        name=$(basename $i)
        echo -n "| $name | "
        xmlstarlet tr $SCRIPT_DIR/pr_results_template.xsl $i/Cucumber.xml | xargs
    fi
done

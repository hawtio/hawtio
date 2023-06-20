<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    <xsl:strip-space elements="*"/>

    <!-- NAME | TESTS | PASSED | SKIPPED | FAILED | ERRORS | TIME -->

    <xsl:template match="/testsuite">
            <xsl:value-of select="@tests"/> | <xsl:value-of select="@tests - @skipped - @failures - @errors" /> | <xsl:value-of select="@skipped"/> | <xsl:value-of select="@failures" /> | <xsl:value-of select="@errors"/> | <xsl:value-of select="@time"/> | 
    </xsl:template>
</xsl:stylesheet>
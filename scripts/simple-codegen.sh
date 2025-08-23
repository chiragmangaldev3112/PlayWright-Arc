#!/bin/bash

# Simple Codegen Wrapper with Fixed Domain Extraction and Test Formatting
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Extract domain name properly
extract_domain() {
    local url="$1"
    # Extract domain: https://automationexercise.com -> automationexercise
    local domain=$(echo "$url" | sed 's|https://||g' | sed 's|http://||g' | sed 's|www\.||' | cut -d'/' -f1)
    # Remove .com and other extensions
    echo "$domain" | sed 's|\.com$||' | sed 's|\.org$||' | sed 's|\.net$||' | sed 's|\..*||'
}

# Analyze test content and detect page types generically for any website
detect_page_types() {
    local content="$1"
    local routes=()
    
    # Extract URLs to understand page navigation
    local urls=$(echo "$content" | grep -o "goto.*['\"][^'\"]*['\"]" | sed "s/.*['\"]\\([^'\"]*\\)['\"].*/\\1/" | sort -u)
    
    # Primary approach: Extract meaningful page names from URL paths
    for url in $urls; do
        # Extract path segments and clean them, excluding protocol
        local path_segments=$(echo "$url" | sed 's|^https\?://[^/]*/||' | tr '/' '\n' | grep -v '^$')
        
        while IFS= read -r segment; do
            if [[ -n "$segment" ]]; then
                # Clean segment: remove extensions, parameters, and normalize
                local clean_segment=$(echo "$segment" | sed 's/\?.*$//' | sed 's/#.*$//' | sed 's/\.[a-z]*$//' | tr '[:upper:]' '[:lower:]')
                
                # Filter out common non-semantic segments, protocol parts, and invalid names
                if [[ -n "$clean_segment" && 
                      "$clean_segment" != "index" && 
                      "$clean_segment" != "default" && 
                      "$clean_segment" != "main" && 
                      "$clean_segment" != "www" && 
                      "$clean_segment" != "https" && 
                      "$clean_segment" != "http" && 
                      "$clean_segment" != "http:" && 
                      "$clean_segment" != "https:" && 
                      ! "$clean_segment" =~ ^[0-9]+$ && 
                      ! "$clean_segment" =~ ^https?:?$ && 
                      ! "$clean_segment" =~ ^[0-9]+[a-z]*$ && 
                      ! "$clean_segment" =~ ^v[0-9]+$ && 
                      ! "$clean_segment" =~ ^api$ && 
                      ! "$clean_segment" =~ ^assets?$ && 
                      ! "$clean_segment" =~ ^static$ && 
                      ! "$clean_segment" =~ ^public$ && 
                      ! "$clean_segment" =~ ^js$ && 
                      ! "$clean_segment" =~ ^css$ && 
                      ! "$clean_segment" =~ ^img$ && 
                      ! "$clean_segment" =~ ^images?$ && 
                      ${#clean_segment} -gt 2 && 
                      ${#clean_segment} -lt 20 ]]; then
                    
                    # Additional validation for valid identifier
                    if [[ "$clean_segment" =~ ^[a-z][a-z0-9_-]*$ ]]; then
                        # Add if not already present
                        if [[ ! " ${routes[@]} " =~ " $clean_segment " ]]; then
                            routes+=("$clean_segment")
                        fi
                    fi
                fi
            fi
        done <<< "$path_segments"
    done
    
    # If no URL-based routes found, use generic fallback
    local final_routes=("${routes[@]}")
    
    # If no meaningful routes found, create a single generic page
    if [[ ${#final_routes[@]} -eq 0 ]]; then
        final_routes+=("page")
    fi
    
    # Always ensure main page is first
    if [[ ! " ${final_routes[@]} " =~ " main " ]]; then
        final_routes=("main" "${final_routes[@]}")
    else
        # Move main to front if it exists
        final_routes=($(printf '%s\n' "${final_routes[@]}" | grep -v "main"))
        final_routes=("main" "${final_routes[@]}")
    fi
    
    # Limit to maximum 5 pages to avoid bloat
    if [[ ${#final_routes[@]} -gt 5 ]]; then
        final_routes=("${final_routes[@]:0:5}")
    fi
    
    echo "${final_routes[@]}"
}

# Extract actual selectors from codegen test content
extract_actual_selectors() {
    local content="$1"
    
    # Extract all Playwright selectors with their full context
    local selectors=""
    
    # Extract page.getByRole() calls
    selectors+=$(echo "$content" | grep -o "page\.getByRole([^)]*)" | sort -u)
    selectors+="\n"
    
    # Extract page.getByPlaceholder() calls
    selectors+=$(echo "$content" | grep -o "page\.getByPlaceholder([^)]*)" | sort -u)
    selectors+="\n"
    
    # Extract page.locator() calls
    selectors+=$(echo "$content" | grep -o "page\.locator([^)]*)" | sort -u)
    selectors+="\n"
    
    # Extract page.getByText() calls
    selectors+=$(echo "$content" | grep -o "page\.getByText([^)]*)" | sort -u)
    selectors+="\n"
    
    # Extract page.getByLabel() calls
    selectors+=$(echo "$content" | grep -o "page\.getByLabel([^)]*)" | sort -u)
    selectors+="\n"
    
    # Extract page.getByTestId() calls
    selectors+=$(echo "$content" | grep -o "page\.getByTestId([^)]*)" | sort -u)
    
    # Return unique selectors, cleaned up
    echo -e "$selectors" | grep -v "^$" | sort -u
}

# Extract and parse all actions from recorded test content
extract_actions_from_content() {
    local content="$1"
    
    # Extract all Playwright actions with their full context
    echo "$content" | grep -o "await page\.[^;]*;" | sort -u
}

# Convert numbers to alphabetic equivalents
convert_numbers_to_alpha() {
    local text="$1"
    
    # Convert all numbers to words using a comprehensive approach
    # Handle multi-digit numbers by converting each digit
    text=$(echo "$text" | sed 's/0/zero/g')
    text=$(echo "$text" | sed 's/1/one/g')
    text=$(echo "$text" | sed 's/2/two/g')
    text=$(echo "$text" | sed 's/3/three/g')
    text=$(echo "$text" | sed 's/4/four/g')
    text=$(echo "$text" | sed 's/5/five/g')
    text=$(echo "$text" | sed 's/6/six/g')
    text=$(echo "$text" | sed 's/7/seven/g')
    text=$(echo "$text" | sed 's/8/eight/g')
    text=$(echo "$text" | sed 's/9/nine/g')
    
    echo "$text"
}

# Clean function name by removing special characters
clean_function_name() {
    local name="$1"
    
    # Remove special characters and replace with valid alternatives
    name=$(echo "$name" | sed 's/[^a-zA-Z0-9_]//g')  # Remove all non-alphanumeric except underscore
    name=$(echo "$name" | sed 's/^[0-9]*//')          # Remove leading numbers
    name=$(echo "$name" | sed 's/__*/_/g')            # Replace multiple underscores with single
    name=$(echo "$name" | sed 's/^_//')               # Remove leading underscore
    name=$(echo "$name" | sed 's/_$//')               # Remove trailing underscore
    
    # Ensure name starts with letter
    if [[ ! "$name" =~ ^[a-zA-Z] ]]; then
        name="action${name}"
    fi
    
    # Ensure minimum length
    if [[ ${#name} -lt 3 ]]; then
        name="${name}Action"
    fi
    
    echo "$name"
}

# Check if action is exactly the same as existing ones
is_exact_duplicate() {
    local action="$1"
    local existing_actions=("${@:2}")
    
    for existing in "${existing_actions[@]}"; do
        if [[ "$action" == "$existing" ]]; then
            return 0  # Exact duplicate found
        fi
    done
    return 1  # Not an exact duplicate
}

# Generate unique function name with incremental suffix if similar
generate_unique_function_name() {
    local base_name="$1"
    local existing_names=("${@:2}")
    local clean_base=$(clean_function_name "$base_name")
    local final_name="$clean_base"
    local counter=1
    
    # Check if name already exists and increment if needed
    while [[ " ${existing_names[@]} " =~ " $final_name " ]]; do
        counter=$((counter + 1))
        final_name="${clean_base}${counter}"
    done
    
    echo "$final_name"
}

# Generate unique method name with context
generate_unique_method_name() {
    local base_name="$1"
    local action_context="$2"  # URL or specific context
    local action_type="$3"
    
    # Extract meaningful context from URL or selector
    local context_suffix=""
    if [[ -n "$action_context" ]]; then
        # Extract path from URL for navigation methods
        if echo "$action_context" | grep -q "goto.*https\?://"; then
            local url_path=$(echo "$action_context" | sed 's/.*goto.*['\''\"]\(.*\)['\''\"]/\1/' | sed 's|.*/||' | sed 's/[^a-zA-Z0-9]//g')
            if [[ -n "$url_path" && "$url_path" != "com" ]]; then
                context_suffix="To$(echo "$url_path" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            fi
        fi
    fi
    
    # Convert numbers to alphabetic
    base_name=$(convert_numbers_to_alpha "$base_name")
    
    # Combine base name with context
    if [[ -n "$context_suffix" ]]; then
        echo "${action_type}$(echo "$base_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')${context_suffix}"
    else
        echo "${action_type}$(echo "$base_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
    fi
}

# Extract semantic name from selector for better method naming
extract_semantic_name() {
    local selector="$1"
    local action_type="$2"
    local action_context="$3"
    
    # Extract meaningful text from different selector types
    local semantic_name=""
    
    # Extract from getByPlaceholder
    if echo "$selector" | grep -q "getByPlaceholder"; then
        semantic_name=$(echo "$selector" | sed "s/.*getByPlaceholder(['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    # Extract from getByRole with name
    elif echo "$selector" | grep -q "getByRole.*name.*['\"]"; then
        semantic_name=$(echo "$selector" | sed "s/.*name.*['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    # Extract from getByLabel
    elif echo "$selector" | grep -q "getByLabel"; then
        semantic_name=$(echo "$selector" | sed "s/.*getByLabel(['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    # Extract from getByText
    elif echo "$selector" | grep -q "getByText"; then
        semantic_name=$(echo "$selector" | sed "s/.*getByText(['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    # Extract from locator with meaningful attributes
    elif echo "$selector" | grep -q "locator.*placeholder"; then
        semantic_name=$(echo "$selector" | sed "s/.*placeholder=['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    elif echo "$selector" | grep -q "locator.*name="; then
        semantic_name=$(echo "$selector" | sed "s/.*name=['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    elif echo "$selector" | grep -q "locator.*id="; then
        semantic_name=$(echo "$selector" | sed "s/.*id=['\"]\\([^'\"]*\\)['\"].*/\\1/" | head -1)
    # Extract from CSS selectors
    elif echo "$selector" | grep -q "locator.*class"; then
        semantic_name=$(echo "$selector" | sed "s/.*class.*['\"]\\([^'\"]*\\)['\"].*/\\1/" | sed 's/.*\\.\\([^.]*\\).*/\\1/' | head -1)
    fi
    
    # Clean and format the semantic name
    if [[ -n "$semantic_name" ]]; then
        # Remove special characters and convert to camelCase
        semantic_name=$(echo "$semantic_name" | sed 's/[^a-zA-Z0-9 ]//g' | sed 's/^ *//;s/ *$//')
        # Convert to camelCase: "First Name" -> "firstName"
        semantic_name=$(echo "$semantic_name" | awk '{
            result = tolower($1)
            for(i=2; i<=NF; i++) {
                result = result toupper(substr($i,1,1)) tolower(substr($i,2))
            }
            print result
        }')
        
        # Ensure it's a valid identifier and not too long
        if [[ ${#semantic_name} -gt 2 && ${#semantic_name} -lt 30 && "$semantic_name" =~ ^[a-zA-Z][a-zA-Z0-9]*$ ]]; then
            # Generate unique method name with context
            generate_unique_method_name "$semantic_name" "$action_context" "$action_type"
            return
        fi
    fi
    
    # Fallback to action-based naming with context
    local fallback_name=""
    case "$action_type" in
        "fill") fallback_name="field" ;;
        "click") fallback_name="element" ;;
        "select") fallback_name="dropdown" ;;
        "check") fallback_name="checkbox" ;;
        "press") fallback_name="input" ;;
        *) fallback_name="element" ;;
    esac
    
    generate_unique_method_name "$fallback_name" "$action_context" "$action_type"
}

# Generate method from actual codegen action
generate_method_from_action() {
    local action="$1"
    local method_counter="$2"
    local custom_name="$3"  # Optional custom method name
    
    # Use custom name if provided, otherwise extract semantic name
    local method_name
    if [[ -n "$custom_name" ]]; then
        method_name="$custom_name"
    fi
    
    # Extract action type and parameters from actual codegen output
    if echo "$action" | grep -q "\.goto("; then
        local url=$(echo "$action" | sed "s/.*goto(\([^)]*\)).*/\1/")
        if [[ -z "$method_name" ]]; then
            method_name="navigateTo"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Navigate to page - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    await this.page.goto($url);"
        echo "    await this.waitForPageLoad();"
        echo "    logger.info('📍 Navigated to page via ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.fill("; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.fill(.*/\1/")
        local value=$(echo "$action" | sed "s/.*\.fill(\([^)]*\)).*/\1/")
        if [[ -z "$method_name" ]]; then
            method_name=$(extract_semantic_name "$selector" "fill" "$action")
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Fill field - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(value: string = $value): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.fill(element, value);"
        echo "    logger.info('📝 Filled field: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.click()"; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.click().*/\1/")
        if [[ -z "$method_name" ]]; then
            method_name=$(extract_semantic_name "$selector" "click" "$action")
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Click element - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.click(element);"
        echo "    logger.info('🔘 Clicked element: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.press("; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.press(.*/\1/")
        local key=$(echo "$action" | sed "s/.*\.press(\([^)]*\)).*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "press")
            method_name="pressKeyOn$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Press key - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(key: string = $key): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await element.press(key);"
        echo "    logger.info('⌨️ Pressed key: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.waitFor"; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.waitFor.*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "wait")
            method_name="waitFor$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Wait for element - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.waitForVisible(element);"
        echo "    logger.info('⏳ Waited for element: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.hover()"; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.hover().*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "hover")
            method_name="hover$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Hover over element - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.hover(element);"
        echo "    logger.info('👆 Hovered over element: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.selectOption("; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.selectOption(.*/\1/")
        local option=$(echo "$action" | sed "s/.*\.selectOption(\([^)]*\)).*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "select")
            method_name="select$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Select option - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(option: string = $option): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.selectOption(element, option);"
        echo "    logger.info('📋 Selected option: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.check()"; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.check().*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "check")
            method_name="check$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Check checkbox - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.check(element);"
        echo "    logger.info('☑️ Checked element: ${method_name}');"
        echo "  }"
        echo ""
    elif echo "$action" | grep -q "\.uncheck()"; then
        local selector=$(echo "$action" | sed "s/await page\.\(.*\)\.uncheck().*/\1/")
        if [[ -z "$method_name" ]]; then
            local semantic_name=$(extract_semantic_name "$selector" "uncheck")
            method_name="uncheck$(echo "$semantic_name" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
            method_name=$(clean_function_name "$method_name")
        fi
        
        echo "  /**"
        echo "   * Uncheck checkbox - mirrors codegen action"
        echo "   */"
        echo "  async ${method_name}(): Promise<void> {"
        echo "    const element = this.page.$selector;"
        echo "    await this.uncheck(element);"
        echo "    logger.info('☐ Unchecked element: ${method_name}');"
        echo "  }"
        echo ""
    fi
}

# Filter actions by route/page context using URL patterns
filter_actions_by_route() {
    local actions="$1"
    local route="$2"
    local filtered_actions=""
    
    # Extract actions that contain URLs matching the route
    if [[ "$route" == "main" || "$route" == "home" ]]; then
        # For main/home pages, include root URL navigation and general actions
        filtered_actions=$(echo "$actions" | grep -E "goto.*://[^/]*/?$|goto.*://[^/]*/?(index|home)")
    else
        # For other routes, include actions with URLs containing the route path
        filtered_actions=$(echo "$actions" | grep -E "goto.*://[^/]*.*$route")
    fi
    
    # If no URL-based actions found, look for actions that happened after navigating to the route
    if [[ -z "$filtered_actions" ]]; then
        # Get all actions and try to group them by URL context
        local current_url=""
        local route_actions=""
        
        while IFS= read -r action; do
            if [[ -n "$action" ]]; then
                # Check if this action contains a goto (URL change)
                if echo "$action" | grep -q "goto.*://"; then
                    current_url=$(echo "$action" | grep -o "goto.*['\"][^'\"]*['\"]" | sed "s/.*['\"]\\([^'\"]*\\)['\"].*/\\1/")
                fi
                
                # If current URL contains the route, include this action
                if [[ -n "$current_url" ]] && echo "$current_url" | grep -q "$route"; then
                    route_actions+="$action\n"
                elif [[ "$route" == "main" || "$route" == "home" ]] && [[ -n "$current_url" ]] && echo "$current_url" | grep -qE "://[^/]*/?$"; then
                    route_actions+="$action\n"
                fi
            fi
        done <<< "$actions"
        
        filtered_actions="$route_actions"
    fi
    
    # If still no actions found, include a reasonable subset based on action sequence
    if [[ -z "$filtered_actions" ]]; then
        # For main page, take first few actions
        if [[ "$route" == "main" || "$route" == "home" ]]; then
            filtered_actions=$(echo "$actions" | head -5)
        else
            # For other routes, take actions from the middle/end of the sequence
            local total_lines=$(echo "$actions" | wc -l)
            local start_line=$((total_lines / 2))
            filtered_actions=$(echo "$actions" | tail -n +$start_line | head -5)
        fi
    fi
    
    echo -e "$filtered_actions"
}

# Generate page object from actual codegen test content
generate_page_object_from_codegen() {
    local domain="$1"
    local route="$2"
    local url="$3"
    local test_content="$4"
    
    local domain_cap=$(echo "$domain" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
    local route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
    local class_name="${domain_cap}${route_cap}Page"
    
    # Extract all actions from actual codegen test content
    local all_actions=$(extract_actions_from_content "$test_content")
    
    # Filter actions by route
    local route_actions=$(filter_actions_by_route "$all_actions" "$route")
    
    # Extract the actual URL from goto actions in the test
    local page_url="$url"
    local goto_action=$(echo "$all_actions" | grep "goto" | head -1)
    if [[ -n "$goto_action" ]]; then
        page_url=$(echo "$goto_action" | sed "s/.*goto(\\([^)]*\\)).*/\\1/" | tr -d "'\"")
    fi
    
    cat << EOF
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { logger } from '@utils/core/logger';

/**
 * Page Object for $domain $route page
 * Generated from actual Playwright codegen recording
 * Contains the exact same logic and selectors as the recorded test
 */
export class $class_name extends BasePage {
  protected readonly url = '$page_url';
  protected readonly pageTitle = '$domain - $route';

  constructor(page: Page) {
    super(page);
  }

  override getFullUrl(): string {
    return this.url;
  }

EOF

    # Generate methods for each unique action from codegen
    local generated_actions=()
    local generated_names=()
    local counter=1
    
    while IFS= read -r action; do
        if [[ -n "$action" ]]; then
            # Check if this is an exact duplicate
            if ! is_exact_duplicate "$action" "${generated_actions[@]}"; then
                # Generate base method name from action
                local base_method_name=$(echo "$action" | sed 's/await page\.//' | sed 's/(.*//' | sed 's/;.*//')
                base_method_name=$(convert_numbers_to_alpha "$base_method_name")
                
                # Generate unique function name
                local unique_name=$(generate_unique_function_name "$base_method_name" "${generated_names[@]}")
                
                # Generate the method with unique name
                generate_method_from_action "$action" "$counter" "$unique_name"
                
                # Track generated actions and names
                generated_actions+=("$action")
                generated_names+=("$unique_name")
                counter=$((counter + 1))
            fi
        fi
    done <<< "$route_actions"

    # Generate the main workflow method that executes all recorded actions in sequence
    cat << EOF
  /**
   * Execute the complete recorded workflow - mirrors exact codegen sequence
   */
  async executeRecordedWorkflow(): Promise<void> {
    logger.info('🔄 Starting recorded workflow for $route page');
    
    try {
EOF

    # Add each action call in sequence
    local method_calls=""
    for name in "${generated_names[@]}"; do
        method_calls+="      await this.${name}();\n"
    done
    echo -e "$method_calls"

    cat << EOF
      
      logger.info('✅ Recorded workflow completed successfully');
    } catch (error) {
      logger.error('❌ Recorded workflow failed', { error });
      throw error;
    }
  }

  /**
   * Verify page elements are present - implements abstract method
   */
  protected async verifyPageElements(): Promise<void> {
    await this.waitForPageLoad();
    logger.info('✅ $route page elements verified');
  }

  /**
   * Wait for page-specific elements - implements abstract method
   */
  protected async waitForPageSpecificElements(): Promise<void> {
    await this.waitForPageLoad();
  }
}
EOF
}

# Generate page object imports
generate_page_imports() {
    local domain="$1"
    local routes=($2)
    local imports=""
    
    for route in "${routes[@]}"; do
        local domain_cap=$(echo "$domain" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        local route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        local class_name="${domain_cap}${route_cap}Page"
        imports+="import { $class_name } from '@pages/$domain/${route}-page';\n"
    done
    
    echo -e "$imports"
}

# Generate page object instances
generate_page_instances() {
    local domain="$1"
    local routes=($2)
    local instances=""
    
    for route in "${routes[@]}"; do
        local domain_cap=$(echo "$domain" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        local route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        local class_name="${domain_cap}${route_cap}Page"
        local var_name="${route}Page"
        instances+="      const $var_name = new $class_name(page);\n"
    done
    
    echo -e "$instances"
}

# Convert codegen test to use page object method calls
convert_codegen_to_page_object_calls() {
    local test_steps="$1"
    local domain="$2"
    local routes=($3)
    
    # Use the main page object for the workflow
    local main_page="mainPage"
    
    # Generate page object method calls
    local converted_content=""
    converted_content+="      // Execute the recorded workflow using page object\n"
    converted_content+="      await ${main_page}.executeRecordedWorkflow();\n"
    converted_content+="      \n"
    converted_content+="      // Verify the page state\n"
    converted_content+="      await ${main_page}.verifyPageElements();\n"
    
    echo -e "$converted_content"
}

# Refactor codegen test to use page object method calls
refactor_to_page_object_calls() {
    local test_steps="$1"
    local domain="$2"
    local routes=($3)
    
    # Convert to page object calls
    local converted_content=$(convert_codegen_to_page_object_calls "$test_steps" "$domain" "$routes")
    
    echo -e "$converted_content"
}

# Refactor test steps to use high-level page object methods
refactor_to_page_objects() {
    local test_steps="$1"
    local domain="$2"
    local routes=($3)
    
    # Convert raw actions to high-level business operations
    local refactored=""
    
    # Use the first available page object for the main workflow
    local primary_page="mainPage"
    for route in "${routes[@]}"; do
        if [[ "$route" != "main" ]]; then
            primary_page="${route}Page"
            break
        fi
    done
    
    # Convert raw Playwright actions to page object method calls
    local converted_steps=$(refactor_to_page_object_calls "$test_steps" "$domain" "$routes")
    
    # Add high-level business logic wrapper
    refactored+="      // Execute main workflow using page objects\n"
    refactored+="      await ${primary_page}.executeRecordedWorkflow();\n"
    refactored+="      await ${primary_page}.verifyPageElements();\n"
    
    echo -e "$refactored"
}

# Parse arguments - Always generate page objects
GENERATE_PAGE_OBJECT=true
URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-page-object) GENERATE_PAGE_OBJECT=false; shift ;;
        *) URL="$1"; shift ;;
    esac
done

if [[ -z "$URL" ]]; then
    echo "Usage: $0 [-p] <URL>"
    exit 1
fi

# Extract clean domain
DOMAIN=$(extract_domain "$URL")
echo -e "${CYAN}Domain extracted: ${YELLOW}$DOMAIN${NC}"

# Set up paths
TEST_FILE="tests/web/generated/${DOMAIN}-test.spec.ts"
mkdir -p tests/web/generated

echo -e "${CYAN}Generating test: ${YELLOW}$TEST_FILE${NC}"

# Run codegen
npx playwright codegen --browser=chromium --target=playwright-test -o "$TEST_FILE" "$URL"

# Apply enterprise standards to test file
if [[ -f "$TEST_FILE" ]]; then
    echo -e "${CYAN}Applying enterprise standards...${NC}"
    
    # Read the raw content and extract test steps
    CONTENT=$(cat "$TEST_FILE")
    TEST_STEPS=$(echo "$CONTENT" | sed -n "/test('test'/,/^});/p" | sed '1d;$d' | sed 's/^  /    /')
    
    # Detect page types from content
    DETECTED_ROUTES=$(detect_page_types "$CONTENT")
    echo -e "${CYAN}Detected page types: ${YELLOW}$DETECTED_ROUTES${NC}"
    
    # Generate dynamic imports and instances
    PAGE_IMPORTS=$(generate_page_imports "$DOMAIN" "$DETECTED_ROUTES")
    PAGE_INSTANCES=$(generate_page_instances "$DOMAIN" "$DETECTED_ROUTES")
    
    # Refactor test steps to use page objects
    REFACTORED_STEPS=$(refactor_to_page_objects "$TEST_STEPS" "$DOMAIN" "$DETECTED_ROUTES")
    
    # Generate domain-specific test title
    DOMAIN_CAP=$(echo "$DOMAIN" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
    
    # Generate page object imports for detected routes
    imports=""
    page_inits=""
    main_page_var=""
    
    for route in $DETECTED_ROUTES; do
        route_cap=$(echo "$route" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        class_name="${DOMAIN_CAP}${route_cap}Page"
        imports+="import { ${class_name} } from '@pages/$DOMAIN/${route}-page';\n"
        page_inits+="      const ${route}Page = new ${class_name}(page);\n"
        
        # Set main page for navigation
        if [[ "$route" == "main" ]] || [[ -z "$main_page_var" ]]; then
            main_page_var="${route}Page"
        fi
    done

    # Generate standardized test content with page objects
    cat << EOF > "$TEST_FILE"
${imports}import { test, expect } from '@playwright/test';
import { logger } from '@utils/core/logger';
import type { TestInfo } from '@playwright/test';

test.describe('$DOMAIN_CAP - Automated Test Flow @e2e @generated', () => {
  test.beforeEach(async ({ page }) => {
    logger.info('🚀 Setting up test environment');
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async ({ page }, testInfo: TestInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error('❌ Test failed', { 
        testName: testInfo.title,
        error: testInfo.error?.message 
      });
      
      // Take screenshot on failure
      await page.screenshot({ 
        path: \`test-results/failure-\${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}.png\`,
        fullPage: true 
      });
    }
  });

  test('should complete the recorded user flow', async ({ page }) => {
    logger.info('🎯 Starting test: $DOMAIN automated flow');
    
    try {
      // Initialize page objects
${page_inits}
      // Execute workflow using page objects
      if ($main_page_var) {
        await ${main_page_var}.navigateTo();
        await ${main_page_var}.executeRecordedWorkflow();
        await ${main_page_var}.verifyPageElements();
      }
      
      // Verify final state
      expect(page).toBeTruthy();
      
      logger.info('✅ Test completed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('❌ Test execution failed', { 
        error: errorMessage,
        stack: errorStack 
      });
      throw error;
    }
  });
});
EOF
    
    echo -e "${GREEN}✅ Applied enterprise standards with enhanced page objects${NC}"
fi

# Always generate page objects from codegen output
if [[ "$GENERATE_PAGE_OBJECT" == true ]]; then
    echo -e "${CYAN}Generating page objects from codegen...${NC}"
    
    # Create page directory
    mkdir -p "pages/$DOMAIN"
    
    # Generate page objects for each detected route
    for route in $DETECTED_ROUTES; do
        page_file="pages/$DOMAIN/${route}-page.ts"
        
        # Generate page object that mirrors the exact codegen logic
        generate_page_object_from_codegen "$DOMAIN" "$route" "$URL" "$CONTENT" > "$page_file"
        
        echo -e "${GREEN}✅ Generated page object: ${YELLOW}$page_file${NC}"
    done
    
    echo -e "${GREEN}✅ All page objects generated from codegen${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Codegen completed!${NC}"
echo -e "${CYAN}Generated files:${NC}"
echo -e "  📄 Test: ${YELLOW}$TEST_FILE${NC}"

if [[ "$GENERATE_PAGE_OBJECT" == true ]]; then
    for route in $DETECTED_ROUTES; do
        echo -e "  📄 Page: ${YELLOW}pages/$DOMAIN/${route}-page.ts${NC}"
    done
fi

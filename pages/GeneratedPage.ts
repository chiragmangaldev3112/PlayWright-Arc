import { Page } from '@playwright/test';
import { logger } from '@utils/core/logger';

/**
 * Page Object Model for GeneratedPage
 * @class
 */
export class GeneratedPage {
  /**
   * Creates an instance of GeneratedPage
   * @param {Page} page - The Playwright Page object
   */
  constructor(private page: Page) {}
  
  // Page URL constant
  private readonly PAGE_URL = 'https://example.com';
  
  // Element selectors
  private readonly RoleTextboxNameEmailAddress = 'role=textbox[name="Email Address"]';
  private readonly RoleButtonNameSignIn = 'role=button[name="Sign in"]';
  private readonly RoleButtonNameImage = 'role=button[name="Image"]';
  private readonly A = 'a';
  private readonly RoleButtonNameManageUser = 'role=button[name="Manage User"]';
  private readonly RoleButtonNameAddUser = 'role=button[name="Add User"]';
  private readonly RoleTextboxNameFirstName = 'role=textbox[name="First Name"]';
  private readonly RoleTextboxNamePassword = 'role=textbox[name="Password"]';
  private readonly RoleTextboxNamePhone = 'role=textbox[name="Phone"]';
  private readonly RoleButtonNameNext = 'role=button[name="Next"]';
  private readonly RoleList = 'role=list';
  private readonly RoleList1 = 'role=list';
  private readonly RoleButtonNameAdd = 'role=button[name="Add"]';
  private readonly RoleButtonNameOk = 'role=button[name="Ok"]';
  
  
  /**
   * Navigates to the page URL
   * @returns {Promise<void>}
   */
  async goto(): Promise<void> {
    logger.step('Navigating to ' + this.PAGE_URL);
    await this.page.goto(this.PAGE_URL);
  }

  /**
   * Clicks on textbox[name="Email Address"] role
   * @returns {Promise<void>}
   */
  async clickTextboxemailAddress(): Promise<void> {
    logger.elementInteraction('click', this.RoleTextboxNameEmailAddress);
    await this.page.locator(this.RoleTextboxNameEmailAddress).click();
  }

  /**
   * Clicks on button[name="Sign in"] role
   * @returns {Promise<void>}
   */
  async clickButtonsignIn(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameSignIn);
    await this.page.locator(this.RoleButtonNameSignIn).click();
  }

  /**
   * Clicks on button[name="Image"] role
   * @returns {Promise<void>}
   */
  async clickButtonimage(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameImage);
    await this.page.locator(this.RoleButtonNameImage).click();
  }

  /**
   * Clicks on element with selector: a
   * @returns {Promise<void>}
   */
  async clickA(): Promise<void> {
    logger.elementInteraction('click', this.A);
    await this.page.locator(this.A).click();
  }

  /**
   * Clicks on button[name="Manage User"] role
   * @returns {Promise<void>}
   */
  async clickButtonmanageUser(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameManageUser);
    await this.page.locator(this.RoleButtonNameManageUser).click();
  }

  /**
   * Clicks on button[name="Add User"] role
   * @returns {Promise<void>}
   */
  async clickButtonaddUser(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameAddUser);
    await this.page.locator(this.RoleButtonNameAddUser).click();
  }

  /**
   * Clicks on textbox[name="First Name"] role
   * @returns {Promise<void>}
   */
  async clickTextboxfirstName(): Promise<void> {
    logger.elementInteraction('click', this.RoleTextboxNameFirstName);
    await this.page.locator(this.RoleTextboxNameFirstName).click();
  }

  /**
   * Clicks on textbox[name="Password"] role
   * @returns {Promise<void>}
   */
  async clickTextboxpassword(): Promise<void> {
    logger.elementInteraction('click', this.RoleTextboxNamePassword);
    await this.page.locator(this.RoleTextboxNamePassword).click();
  }

  /**
   * Clicks on textbox[name="Phone"] role
   * @returns {Promise<void>}
   */
  async clickTextboxphone(): Promise<void> {
    logger.elementInteraction('click', this.RoleTextboxNamePhone);
    await this.page.locator(this.RoleTextboxNamePhone).click();
  }

  /**
   * Clicks on button[name="Next"] role
   * @returns {Promise<void>}
   */
  async clickButtonnext(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameNext);
    await this.page.locator(this.RoleButtonNameNext).click();
  }

  /**
   * Clicks on list role
   * @returns {Promise<void>}
   */
  async clickListButton(): Promise<void> {
    logger.elementInteraction('click', this.RoleList);
    await this.page.locator(this.RoleList).click();
  }

  /**
   * Clicks on button[name="Add"] role
   * @returns {Promise<void>}
   */
  async clickButtonadd(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameAdd);
    await this.page.locator(this.RoleButtonNameAdd).click();
  }

  /**
   * Clicks on button[name="Ok"] role
   * @returns {Promise<void>}
   */
  async clickButtonok(): Promise<void> {
    logger.elementInteraction('click', this.RoleButtonNameOk);
    await this.page.locator(this.RoleButtonNameOk).click();
  }
}
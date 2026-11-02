import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const post = vi.fn();
vi.mock("axios", () => ({ default: { post: (...a) => post(...a) } }));

const { TRACKING_EVENTS, trackEvent } = await import("../tracking");

const lastCall = () => post.mock.calls[post.mock.calls.length - 1];

describe("trackEvent", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MATOMO_URL", "https://matomo.test/m");
    vi.stubEnv("VITE_MATOMO_SITE_ID", "7");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("posts idsite, rec, e_c and e_a to the tracker url without headers", () => {
    post.mockResolvedValue({});
    const before = post.mock.calls.length;
    trackEvent(TRACKING_EVENTS.authorizeClick());
    expect(post.mock.calls.length).toBe(before + 1);
    const [url, ...rest] = lastCall();
    expect(url.startsWith("https://matomo.test/m?")).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get("idsite")).toBe("7");
    expect(params.get("rec")).toBe("1");
    expect(params.get("e_c")).toBe("Interacción");
    expect(params.get("e_a")).toBe("Autorizar Pagos");
    expect(rest).toEqual([]);
  });

  it("does nothing without VITE_MATOMO_URL, reading it at emit time", () => {
    post.mockResolvedValue({});
    const before = post.mock.calls.length;
    vi.stubEnv("VITE_MATOMO_URL", "");
    trackEvent(TRACKING_EVENTS.paymentReleased());
    expect(post.mock.calls.length).toBe(before);
    vi.stubEnv("VITE_MATOMO_URL", "https://matomo.test/m");
    trackEvent(TRACKING_EVENTS.paymentReleased());
    expect(post.mock.calls.length).toBe(before + 1);
  });

  it("does nothing without VITE_MATOMO_SITE_ID", () => {
    post.mockResolvedValue({});
    const before = post.mock.calls.length;
    vi.stubEnv("VITE_MATOMO_SITE_ID", "");
    trackEvent(TRACKING_EVENTS.authorizationRejected());
    expect(post.mock.calls.length).toBe(before);
  });

  it("never propagates failures", () => {
    post.mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() =>
      trackEvent(TRACKING_EVENTS.authorizationRejected())
    ).not.toThrow();
    post.mockImplementation(() => Promise.reject(new Error("down")));
    expect(() =>
      trackEvent(TRACKING_EVENTS.authorizationRejected())
    ).not.toThrow();
  });
});

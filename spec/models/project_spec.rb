require 'spec_helper'

describe Project do
  before do
    @project = create(:project)
  end

  it "should autogenerate an API key" do
    SecureRandom.stub(:hex).and_return("0000000000000000")
    @project = create(:project)
    expect(@project.api_key).to eq("0000000000000000")
  end
end
